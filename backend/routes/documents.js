const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Document = require('../models/Document');
const Summary = require('../models/Summary');
const Quiz = require('../models/Quiz');
const Flashcard = require('../models/Flashcard');
const auth = require('../middleware/auth');
const OCRProcessor = require('../utils/ocrProcessor');
const aiService = require('../utils/aiServiceClient');

const router = express.Router();

// Debug middleware - log all requests to documents router
router.use((req, res, next) => {
  console.log(`📥 Documents router - ${req.method} ${req.path} - ID: ${req.params.id || 'N/A'}`);
  next();
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,txt,docx,md,png,jpg,jpeg,gif').split(',');
    const fileExt = path.extname(file.originalname).toLowerCase().substring(1);
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`File type .${fileExt} is not allowed`), false);
    }
  }
});

// Extract text from different file types
const extractTextFromFile = async (filePath, fileType) => {
  try {
    switch (fileType) {
      case 'pdf':
        const pdfBuffer = await fs.readFile(filePath);
        
        // Use OCR processor for scanned PDFs
        const result = await OCRProcessor.processPDFWithOCR(filePath, pdfBuffer);
        console.log(`PDF processing method: ${result.method}`);
        
        return result.text;
      
      case 'txt':
        return await fs.readFile(filePath, 'utf-8');
      
      case 'docx':
        const docxBuffer = await fs.readFile(filePath);
        const docxResult = await mammoth.extractRawText({ buffer: docxBuffer });
        return docxResult.value;
      
      case 'md':
        return await fs.readFile(filePath, 'utf-8');
      
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        // Process image files with OCR
        const imageResult = await OCRProcessor.processImageWithOCR(filePath);
        console.log(`Image processing method: ${imageResult.method}`);
        return imageResult.text;
      
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error('Error extracting text:', error);
    throw new Error('Failed to extract text from file');
  }
};

// Upload and log process document (auth temporarily disabled for testing)
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, description } = req.body;
    const filePath = req.file.path;
    const fileType = path.extname(req.file.originalname).toLowerCase().substring(1);

    // Extract text from file
    const extractedText = await extractTextFromFile(filePath, fileType);

    // Create document record (using test user ID if no auth)
    const document = new Document({
      title: title || req.file.originalname,
      description: description || '',
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: filePath,
      fileType: fileType,
      fileSize: req.file.size,
      extractedText: extractedText,
      userId: req.user?.id || null, // No user for testing
      status: 'processed'
    });

    await document.save();

    // Add embeddings to vector database (async, non-blocking)
    // Currently disabled - MongoDB stores only user data and metadata
    // ChromaDB stores embeddings for AI search (not yet active)
    // aiService.addEmbeddings(
    //   document._id.toString(),
    //   extractedText,
    //   {
    //     document_id: document._id.toString(),
    //     user_id: req.user.id,
    //     title: document.title,
    //     file_type: fileType
    //   }
    // ).then(() => {
    //   console.log(`✅ Embeddings added for document ${document._id}`);
    // }).catch(err => {
    //   console.error(`⚠️ Failed to add embeddings for document ${document._id}:`, err);
    // });

    // Clean up file after processing (optional)
    // await fs.unlink(filePath);

    res.json({
      success: true,
      document: {
        id: document._id,
        title: document.title,
        description: document.description,
        fileType: document.fileType,
        fileSize: document.fileSize,
        extractedText: document.extractedText,
        createdAt: document.createdAt
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }

    res.status(500).json({ 
      error: 'Failed to process document',
      message: error.message 
    });
  }
});

// Process text content directly
router.post('/process-text', async (req, res) => {
  try {
    const { title, content, description } = req.body;

    if (!content || !title) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Create document record for text content
    const document = new Document({
      title: title,
      description: description || '',
      extractedText: content,
      fileType: 'text',
      userId: req.user?.id || null, // No user for testing
      status: 'processed'
    });

    await document.save();

    res.json({
      success: true,
      document: {
        id: document._id,
        title: document.title,
        description: document.description,
        extractedText: document.extractedText,
        createdAt: document.createdAt
      }
    });

  } catch (error) {
    console.error('Text processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process text content',
      message: error.message 
    });
  }
});

// Public history endpoint (no auth) - MUST be before /:id to match correctly
router.get('/history', async (req, res) => {
  try {
    console.log('📜 History endpoint hit');
    const docs = await Document.find({}).sort({ createdAt: -1 }).limit(100);
    const docIds = docs.map(d => d._id);
    console.log(`📄 Found ${docs.length} documents`);
    
    const [summaries, quizzes, flashcards] = await Promise.all([
      require('../models/Summary').find({ documentId: { $in: docIds } }).select('documentId').lean(),
      require('../models/Quiz').find({ documentId: { $in: docIds } }).select('documentId').lean(),
      require('../models/Flashcard').find({ documentId: { $in: docIds } }).select('documentId').lean()
    ]);
    
    console.log(`📊 Found: ${summaries.length} summaries, ${quizzes.length} quizzes, ${flashcards.length} flashcards`);
    
    const hasSummary = new Set(summaries.map(s => String(s.documentId)));
    const hasQuiz = new Set(quizzes.map(s => String(s.documentId)));
    const hasFlash = new Set(flashcards.map(s => String(s.documentId)));
    
    const items = docs.map(d => {
      const docIdStr = String(d._id);
      const hasS = hasSummary.has(docIdStr);
      const hasQ = hasQuiz.has(docIdStr);
      const hasF = hasFlash.has(docIdStr);
      
      // Debug for first few items
      if (docs.indexOf(d) < 3) {
        console.log(`📋 ${d.title}: hasSummary=${hasS}, hasQuiz=${hasQ}, hasFlashcards=${hasF}, docId=${docIdStr}`);
      }
      
      return {
        id: String(d._id),
        title: d.title,
        createdAt: d.createdAt,
        hasSummary: hasS,
        hasQuiz: hasQ,
        hasFlashcards: hasF
      };
    });
    
    console.log(`✅ Returning ${items.length} documents`);
    res.json({ success: true, documents: items });
  } catch (e) {
    console.error('❌ History error:', e);
    res.status(500).json({ error: 'Failed to fetch history', message: e.message });
  }
});

// Get user's documents
router.get('/my-documents', auth, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('-extractedText'); // Exclude full text for list view

    res.json({
      success: true,
      documents: documents
    });

  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch documents',
      message: error.message 
    });
  }
});

// Delete document - MUST be before GET /:id to avoid route conflicts
router.delete('/:id', async (req, res) => {
  console.log(`🗑️ DELETE /:id route HIT! ID: ${req.params.id}`);
  console.log(`🗑️ Request method: ${req.method}, URL: ${req.url}`);
  try {
    const documentId = req.params.id;
    console.log(`🗑️ Delete request for document ID: ${documentId} (length: ${documentId.length})`);
    
    // Import mongoose for ObjectId conversion
    const mongoose = require('mongoose');
    
    // Validate and convert to ObjectId
    let objectId;
    try {
      // If it's exactly 24 characters, try to convert directly
      if (documentId.length === 24 && /^[0-9a-fA-F]{24}$/.test(documentId)) {
        objectId = new mongoose.Types.ObjectId(documentId);
      } else {
        // If it's longer, try to extract the first 24 characters
        const shortId = documentId.substring(0, 24);
        if (/^[0-9a-fA-F]{24}$/.test(shortId)) {
          console.log(`⚠️ ID is ${documentId.length} chars, using first 24: ${shortId}`);
          objectId = new mongoose.Types.ObjectId(shortId);
        } else {
          throw new Error('Invalid ID format');
        }
      }
    } catch (error) {
      console.error(`❌ Invalid document ID format: ${documentId}`, error);
      return res.status(400).json({ 
        error: 'Invalid document ID format',
        message: 'Document ID must be a valid MongoDB ObjectId'
      });
    }
    
    console.log(`🔍 Searching for document with ObjectId: ${objectId}`);
    console.log(`🔍 Original ID string: ${documentId}`);
    
    // Try multiple query strategies - simplified for no-auth scenario
    let document = null;
    
    // Strategy 1: Direct findById with ObjectId
    console.log(`🔍 Strategy 1: findById with ObjectId`);
    document = await Document.findById(objectId);
    
    // Strategy 2: Try with string directly
    if (!document) {
      console.log(`⚠️ Strategy 1 failed, trying findById with string: ${documentId}`);
      document = await Document.findById(documentId);
    }
    
    // Strategy 3: Try findOne with ObjectId
    if (!document) {
      console.log(`⚠️ Strategy 2 failed, trying findOne with ObjectId`);
      document = await Document.findOne({ _id: objectId });
    }
    
    // Strategy 4: Try findOne with string
    if (!document) {
      console.log(`⚠️ Strategy 3 failed, trying findOne with string`);
      document = await Document.findOne({ _id: documentId });
    }
    
    console.log(`📄 Found document: ${document ? document.title : 'NOT FOUND'}`);
    
    if (!document) {
      // List some actual document IDs for debugging
      const sampleDocs = await Document.find({}).limit(5).select('_id title userId createdAt');
      console.log(`📋 Sample documents in DB (first 5):`, 
        sampleDocs.map(d => ({ 
          id: String(d._id), 
          title: d.title,
          userId: d.userId ? String(d.userId) : 'null',
          createdAt: d.createdAt
        }))
      );
      
      // Also check if any document matches by string comparison
      const allDocs = await Document.find({}).select('_id title');
      const matchingDoc = allDocs.find(d => String(d._id) === documentId);
      console.log(`🔍 Direct string match found:`, matchingDoc ? matchingDoc.title : 'NO MATCH');
      
      return res.status(404).json({ 
        error: 'Document not found',
        message: `Document with ID ${documentId} not found in database`,
        searchedId: String(objectId),
        requestUser: req.user ? req.user.id : 'not authenticated'
      });
    }

    // Delete file if it exists
    if (document.filePath) {
      try {
        await fs.unlink(document.filePath);
      } catch (fileError) {
        console.error('File deletion error:', fileError);
      }
    }

    // Delete embeddings from vector database (async, non-blocking)
    aiService.deleteEmbeddings(String(objectId)).catch(err => {
      console.error('Failed to delete embeddings:', err);
    });

    // Delete associated summaries, quizzes, and flashcards
    await Promise.all([
      Summary.deleteMany({ documentId: objectId }),
      Quiz.deleteMany({ documentId: objectId }),
      Flashcard.deleteMany({ documentId: objectId })
    ]);

    await Document.findByIdAndDelete(objectId);
    console.log(`✅ Document deleted successfully: ${document.title}`);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ 
      error: 'Failed to delete document',
      message: error.message 
    });
  }
});

// Get specific document - MUST be AFTER DELETE /:id
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({
      success: true,
      document: document
    });

  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch document',
      message: error.message 
    });
  }
});

module.exports = router;



