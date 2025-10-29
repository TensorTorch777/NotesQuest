const router = require("express").Router();
const ai = require("../aiClient");
const Document = require("../models/Document");
const Summary = require("../models/Summary");
const Quiz = require("../models/Quiz");
const Flashcard = require("../models/Flashcard");
const Chat = require("../models/Chat");

router.post("/generate-summary", async (req, res) => {
  try {
    const { documentId, content, title } = req.body || {};
    console.log(`📥 Generate summary request - documentId: ${documentId}, hasContent: ${!!content}, hasTitle: ${!!title}`);
    
    let actualContent = content;
    let actualTitle = title;
    let docId = documentId;
    
    // If documentId is provided, fetch the document
    if (documentId && !actualContent) {
      console.log(`📄 Fetching document ${documentId}...`);
      const doc = await Document.findById(documentId);
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }
      actualContent = doc.extractedText || doc.content;
      actualTitle = doc.title;
      docId = doc._id; // Use the ObjectId from DB
    }
    
    if (!actualContent || typeof actualContent !== "string" || actualContent.length < 20) {
      return res.status(400).json({ error: "content must be a non-empty string (>=20 chars)" });
    }
    if (!actualTitle || typeof actualTitle !== "string") {
      return res.status(400).json({ error: "title must be a string" });
    }
    if (actualContent.length > 1_000_000) {
      return res.status(413).json({ error: "Document too large. Please split and try again." });
    }

    console.log(`📤 Calling AI service: ${process.env.AI_SERVICE_URL || "http://127.0.0.1:8000"}/generate/summary`);
    console.log(`📏 Content length: ${actualContent.length} chars, title: "${actualTitle}"`);
    
    const r = await ai.post("/generate/summary", { content: actualContent, title: actualTitle });
    
    console.log(`📥 AI service response: status=${r.status}`);
    
    if (r.status >= 200 && r.status < 300) {
      // Persist summary
      try {
        const payload = r.data?.data || r.data;
        if (!docId) {
          const found = await Document.findOne({ title: actualTitle }).sort({ createdAt: -1 });
          docId = found?._id;
        }
        if (docId) {
          console.log(`💾 Saving summary for documentId: ${docId}`);
          const saved = await Summary.create({
            documentId: docId,
            userId: null,
            content: payload?.content || payload?.data || '',
            maxLength: 500,
            model: payload?.model || 'Qwen2.5-7B-Instruct'
          });
          console.log(`✅ Summary saved successfully with _id: ${saved._id}, documentId: ${saved.documentId}`);
        } else {
          console.warn(`⚠️ No documentId available to save summary for title: ${actualTitle}`);
        }
      } catch (e) { console.error('⚠️ Failed to save summary:', e?.message, e?.stack); }
      return res.json(r.data);
    }
    
    // Log detailed error for debugging
    console.error("❌ AI service error:", {
      status: r.status,
      statusText: r.statusText,
      data: r.data,
      headers: r.headers
    });
    
    return res.status(502).json({ 
      error: "AI service error", 
      status: r.status,
      detail: r.data?.detail || r.data?.message || JSON.stringify(r.data)
    });
  } catch (err) {
    console.error("❌ Backend error:", err);
    return res.status(500).json({ error: "backend error", message: err.message, stack: err.stack });
  }
});

router.post("/generate-quiz", async (req, res) => {
  console.log("🎯 /generate-quiz endpoint hit!");
  console.log("Request body:", req.body);
  
  try {
    const { documentId, content, title, numQuestions } = req.body || {};
    console.log(`📥 Generate quiz request - documentId: ${documentId}, hasContent: ${!!content}, hasTitle: ${!!title}`);
    
    let actualContent = content;
    let actualTitle = title;
    let docId = documentId;
    
    // If documentId is provided, fetch the document
    if (documentId && !actualContent) {
      console.log(`📄 Fetching document ${documentId}...`);
      const doc = await Document.findById(documentId);
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }
      actualContent = doc.extractedText || doc.content;
      actualTitle = doc.title;
      docId = doc._id; // Use the ObjectId from DB
    }
    
    console.log(`📊 Full document received: ${actualContent.length} chars`);
    
    if (!actualContent || typeof actualContent !== "string" || actualContent.length < 20) {
      return res.status(400).json({ error: "content must be a non-empty string (>=20 chars)" });
    }
    if (!actualTitle || typeof actualTitle !== "string") {
      return res.status(400).json({ error: "title must be a string" });
    }

    console.log(`📤 Calling AI service for quiz...`);
    console.log(`📏 Content length: ${actualContent.length} chars, title: "${actualTitle}"`);
    
    try {
      // Calculate appropriate number of questions based on document length
      const questionsPer10kChars = 3; // 3 questions per 10k characters
      const calculatedQuestions = Math.max(8, Math.min(30, Math.floor(actualContent.length / 10000 * questionsPer10kChars)));
      const numQuestionsToGenerate = numQuestions || calculatedQuestions;
      
      console.log(`📝 Generating ${numQuestionsToGenerate} questions from ${actualContent.length} chars`);
      
      const r = await ai.post("/generate/quiz", { 
        content: actualContent, 
        title: actualTitle,
        num_questions: numQuestionsToGenerate
      });
      
      console.log(`📥 AI service response: status=${r.status}, data keys:`, Object.keys(r.data || {}));
      
      if (r.status >= 200 && r.status < 300) {
        // Persist quiz
        try {
          const payload = r.data?.data || r.data;
          if (!docId) {
            const found = await Document.findOne({ title: actualTitle }).sort({ createdAt: -1 });
            docId = found?._id;
          }
          if (docId) {
            console.log(`💾 Saving quiz for documentId: ${docId}`);
            const saved = await Quiz.create({
              documentId: docId,
              userId: null,
              questionsText: payload?.questions || '',
              numQuestions: payload?.num_questions || payload?.numQuestions || 0,
              model: 'Qwen2.5-7B-Instruct'
            });
            console.log(`✅ Quiz saved successfully with _id: ${saved._id}, documentId: ${saved.documentId}`);
          } else {
            console.warn(`⚠️ No documentId available to save quiz for title: ${actualTitle}`);
          }
        } catch (e) { console.error('⚠️ Failed to save quiz:', e?.message, e?.stack); }
        return res.json(r.data);
      }
      
      console.error("❌ AI service error:", r.data);
      return res.status(502).json({ error: "AI service error", detail: r.data?.detail });
    } catch (aiErr) {
      console.error("❌ Failed to call AI service:", aiErr.message);
      return res.status(502).json({ error: "Failed to call AI service", detail: aiErr.message });
    }
  } catch (err) {
    console.error("❌ Backend error:", err);
    return res.status(500).json({ error: "backend error", message: err.message });
  }
});

router.post("/generate-flashcards", async (req, res) => {
  try {
    const { documentId, content, title, numCards } = req.body || {};
    console.log(`📥 Generate flashcards request - documentId: ${documentId}, hasContent: ${!!content}, hasTitle: ${!!title}`);
    
    let actualContent = content;
    let actualTitle = title;
    let docId = documentId;
    
    if (documentId && !actualContent) {
      console.log(`📄 Fetching document ${documentId}...`);
      const doc = await Document.findById(documentId);
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }
      actualContent = doc.extractedText || doc.content;
      actualTitle = doc.title;
      docId = doc._id; // Use the ObjectId from DB
    }
    
    if (!actualContent || typeof actualContent !== "string" || actualContent.length < 20) {
      return res.status(400).json({ error: "content must be a non-empty string (>=20 chars)" });
    }

    console.log(`📤 Calling AI service for flashcards...`);
    
    const r = await ai.post("/generate/flashcards", { 
      content: actualContent, 
      title: actualTitle,
      num_cards: numCards || 12
    });
    
    if (r.status >= 200 && r.status < 300) {
      // Persist flashcards
      try {
        const payload = r.data?.data || r.data;
        const cards = (payload?.flashcards || []).map(c => ({ front: c.term || c.front, back: c.definition || c.back, category: c.category || 'General', difficulty: c.difficulty || 'easy' }));
        if (!docId) {
          const found = await Document.findOne({ title: actualTitle }).sort({ createdAt: -1 });
          docId = found?._id;
        }
        if (docId) {
          console.log(`💾 Saving flashcards for documentId: ${docId} (${cards.length} cards)`);
          const saved = await Flashcard.create({
            documentId: docId,
            userId: null,
            cards,
            numCards: cards.length,
            model: 'Qwen2.5-7B-Instruct'
          });
          console.log(`✅ Flashcards saved successfully with _id: ${saved._id}, documentId: ${saved.documentId}`);
        } else {
          console.warn(`⚠️ No documentId available to save flashcards for title: ${actualTitle}`);
        }
      } catch (e) { console.error('⚠️ Failed to save flashcards:', e?.message, e?.stack); }
      return res.json(r.data);
    }
    
    return res.status(502).json({ error: "AI service error", detail: r.data?.detail });
  } catch (err) {
    console.error("❌ Backend error:", err);
    return res.status(500).json({ error: "backend error", message: err.message });
  }
});

// Chat endpoints (must be before dynamic routes)

// Get all chats for user (no auth required for now - allow null userId)
router.get('/chats', async (req, res) => {
  try {
    const userId = req.user?.id || null;
    // Query for chats where userId matches (null for unauthenticated users)
    const query = userId ? { userId: userId } : { userId: null };
    console.log(`📋 Fetching chats with query:`, JSON.stringify(query));
    
    const chats = await Chat.find(query)
      .sort({ updatedAt: -1 })
      .select('_id title createdAt updatedAt messages')
      .limit(100);
    
    console.log(`✅ Found ${chats.length} chats for userId: ${userId || 'null'}`);
    console.log(`📋 Chat titles:`, chats.map(c => c.title).slice(0, 5));
    
    return res.json({
      success: true,
      chats: chats.map(chat => ({
        id: chat._id.toString(),
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messageCount: chat.messages?.length || 0
      }))
    });
  } catch (err) {
    console.error('❌ Get chats error:', err);
    return res.status(500).json({ error: 'Failed to fetch chats', message: err.message });
  }
});

// Get specific chat by ID
router.get('/chat/:chatId', async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const query = userId ? { _id: req.params.chatId, userId: userId } : { _id: req.params.chatId, userId: null };
    const chat = await Chat.findOne(query);
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    return res.json({
      success: true,
      chat: {
        id: chat._id.toString(),
        title: chat.title,
        messages: chat.messages || [], // Messages include thinking field if present
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      }
    });
  } catch (err) {
    console.error('❌ Get chat error:', err);
    return res.status(500).json({ error: 'Failed to fetch chat', message: err.message });
  }
});

// Create new chat
router.post('/chat/new', async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const { title } = req.body;
    
    console.log(`✨ Creating new chat - title: "${title || 'New Chat'}", userId: ${userId || 'null'}`);
    
    const chat = await Chat.create({
      userId: userId || null,
      title: title || 'New Chat',
      messages: []
    });
    
    console.log(`✅ New chat created: ${chat._id}, title: "${chat.title}"`);
    
    return res.json({
      success: true,
      chat: {
        id: chat._id.toString(),
        title: chat.title,
        messages: [],
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      }
    });
  } catch (err) {
    console.error('❌ Create chat error:', err);
    return res.status(500).json({ error: 'Failed to create chat', message: err.message });
  }
});

// Save already-generated chat content (for streaming) - no auth required
router.post('/chat/save', async (req, res) => {
  try {
    const { chatId, message, thinking, userMessage } = req.body;
    const userId = req.user?.id || null;
    
    console.log(`💾 Save chat request:`, {
      chatId: chatId || 'new',
      messageLength: message?.length || 0,
      hasThinking: !!thinking,
      userMessageLength: userMessage?.length || 0,
      userId: userId || 'null'
    });
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      console.error('❌ Invalid message in save request');
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!userMessage || typeof userMessage !== 'string' || userMessage.trim().length === 0) {
      console.error('❌ Invalid userMessage in save request');
      return res.status(400).json({ error: 'User message is required' });
    }

    // Save to database
    let chat;
    if (chatId) {
      // Update existing chat
      const query = userId ? { _id: chatId, userId: userId } : { _id: chatId, userId: null };
      chat = await Chat.findOne(query);
      if (!chat) {
        console.error(`❌ Chat not found: ${chatId}`);
        return res.status(404).json({ error: 'Chat not found' });
      }
      
      // Add new messages
      chat.messages.push({
        role: 'user',
        content: userMessage.trim(),
        timestamp: new Date()
      });
      const assistantMessage = {
        role: 'assistant',
        content: message.trim(),
        timestamp: new Date()
      };
      if (thinking) {
        assistantMessage.thinking = thinking;
      }
      chat.messages.push(assistantMessage);
      
      // Update title if still "New Chat"
      if (chat.title === 'New Chat' && chat.messages.length >= 2) {
        const firstUserMsg = chat.messages.find(m => m.role === 'user')?.content || '';
        chat.title = firstUserMsg.slice(0, 50) + (firstUserMsg.length > 50 ? '...' : '');
      }
      
      chat.updatedAt = new Date();
      await chat.save();
      console.log(`✅ Chat updated: ${chat._id}, title: "${chat.title}", messages: ${chat.messages.length}`);
    } else {
      // Create new chat
      const title = userMessage.trim().slice(0, 50) + (userMessage.trim().length > 50 ? '...' : '');
      const assistantMessage = {
        role: 'assistant',
        content: message.trim(),
        timestamp: new Date()
      };
      if (thinking) {
        assistantMessage.thinking = thinking;
      }
      chat = await Chat.create({
        userId: userId || null,
        title: title,
        messages: [
          {
            role: 'user',
            content: userMessage.trim(),
            timestamp: new Date()
          },
          assistantMessage
        ]
      });
      console.log(`✅ New chat created: ${chat._id}, title: "${chat.title}", userId: ${userId || 'null'}`);
    }

    return res.json({
      success: true,
      chatId: chat._id.toString(),
      chat: {
        id: chat._id.toString(),
        title: chat.title,
        messages: chat.messages,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      }
    });
  } catch (err) {
    console.error('❌ Save chat error:', err);
    console.error('❌ Error stack:', err.stack);
    return res.status(500).json({ 
      error: 'Failed to save chat', 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Send message in chat (create or update)
router.post('/chat', async (req, res) => {
  try {
    const { chatId, message, history = [] } = req.body;
    const userId = req.user?.id || null;
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required and must be a non-empty string' });
    }

    console.log(`💬 Chat request - chatId: ${chatId || 'new'}, message length: ${message.length}, history length: ${history.length}`);
    
    // Call AI service for chat (non-streaming)
    const r = await ai.post('/chat', {
      message: message.trim(),
      history: history
    });

    if (r.status < 200 || r.status >= 300) {
      return res.status(502).json({ 
        error: 'AI service error', 
        detail: r.data?.detail || r.data?.message 
      });
    }

    const aiResponse = r.data?.message || r.data?.data?.message || r.data?.response || 'No response generated';
    const thinking = r.data?.data?.thinking || r.data?.thinking || null;
    
    // Save to database
    let chat;
    if (chatId) {
      // Update existing chat
      const query = userId ? { _id: chatId, userId: userId } : { _id: chatId, userId: null };
      chat = await Chat.findOne(query);
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }
      
      // Add new messages
      chat.messages.push({
        role: 'user',
        content: message.trim(),
        timestamp: new Date()
      });
      const assistantMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      // Add thinking if available
      if (thinking) {
        assistantMessage.thinking = thinking;
      }
      chat.messages.push(assistantMessage);
      
      // Generate title from first user message if title is still "New Chat"
      if (chat.title === 'New Chat' && chat.messages.length >= 2) {
        const firstUserMessage = chat.messages.find(m => m.role === 'user')?.content || '';
        chat.title = firstUserMessage.slice(0, 50) + (firstUserMessage.length > 50 ? '...' : '');
      }
      
      chat.updatedAt = new Date();
      await chat.save();
      console.log(`💾 Chat updated: ${chat._id}, title: ${chat.title}, messages: ${chat.messages.length}`);
    } else {
      // Create new chat
      const title = message.trim().slice(0, 50) + (message.trim().length > 50 ? '...' : '');
      const assistantMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      // Add thinking if available
      if (thinking) {
        assistantMessage.thinking = thinking;
      }
      chat = await Chat.create({
        userId: userId || null,
        title: title,
        messages: [
          {
            role: 'user',
            content: message.trim(),
            timestamp: new Date()
          },
          assistantMessage
        ]
      });
      console.log(`✨ New chat created: ${chat._id}, title: ${chat.title}, userId: ${userId || 'null'}`);
    }

    return res.json({
      success: true,
      message: aiResponse,
      thinking: thinking, // Include thinking step if available
      chatId: chat._id.toString(),
      chat: {
        id: chat._id.toString(),
        title: chat.title,
        messages: chat.messages,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      },
      ...(r.data?.data || {})
    });
  } catch (err) {
    console.error('❌ Chat error:', err);
    return res.status(500).json({ 
      error: 'Failed to process chat', 
      message: err.message 
    });
  }
});

// Update chat title
router.put('/chat/:chatId/title', async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const { title } = req.body;
    
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const query = userId ? { _id: req.params.chatId, userId: userId } : { _id: req.params.chatId, userId: null };
    const chat = await Chat.findOneAndUpdate(
      query,
      { title: title.trim(), updatedAt: new Date() },
      { new: true }
    );
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    return res.json({
      success: true,
      chat: {
        id: chat._id.toString(),
        title: chat.title
      }
    });
  } catch (err) {
    console.error('❌ Update chat title error:', err);
    return res.status(500).json({ error: 'Failed to update chat title', message: err.message });
  }
});

// Delete chat
router.delete('/chat/:chatId', async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const query = userId ? { _id: req.params.chatId, userId: userId } : { _id: req.params.chatId, userId: null };
    const chat = await Chat.findOneAndDelete(query);
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    return res.json({ success: true, message: 'Chat deleted successfully' });
  } catch (err) {
    console.error('❌ Delete chat error:', err);
    return res.status(500).json({ error: 'Failed to delete chat', message: err.message });
  }
});

// Fetch latest generated by documentId
router.get('/summary/:documentId', async (req, res) => {
  try {
    const item = await Summary.findOne({ documentId: req.params.documentId }).sort({ createdAt: -1 });
    if (!item) return res.status(404).json({ error: 'Summary not found' });
    return res.json({ success: true, summary: { content: item.content, title: (await Document.findById(item.documentId))?.title, model: item.model, createdAt: item.createdAt } });
  } catch (e) {
    return res.status(500).json({ error: 'failed', message: e.message });
  }
});

router.get('/quiz/:documentId', async (req, res) => {
  try {
    const item = await Quiz.findOne({ documentId: req.params.documentId }).sort({ createdAt: -1 });
    if (!item) return res.status(404).json({ error: 'Quiz not found' });
    return res.json({ success: true, quiz: { questions: item.questionsText, title: (await Document.findById(item.documentId))?.title, numQuestions: item.numQuestions, createdAt: item.createdAt } });
  } catch (e) {
    return res.status(500).json({ error: 'failed', message: e.message });
  }
});

router.get('/flashcards/:documentId', async (req, res) => {
  try {
    const item = await Flashcard.findOne({ documentId: req.params.documentId }).sort({ createdAt: -1 });
    if (!item) return res.status(404).json({ error: 'Flashcards not found' });
    return res.json({ success: true, flashcards: item.cards, title: (await Document.findById(item.documentId))?.title, numCards: item.numCards, createdAt: item.createdAt });
  } catch (e) {
    return res.status(500).json({ error: 'failed', message: e.message });
  }
});

module.exports = router;
