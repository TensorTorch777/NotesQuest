/**
 * OCR Processor for scanned documents
 * Uses Tesseract.js for OCR functionality
 */

const fs = require('fs').promises;
const Tesseract = require('tesseract.js');
const path = require('path');

class OCRProcessor {
  /**
   * Check if PDF contains text layers
   */
  static async hasTextLayer(pdfBuffer) {
    try {
      const pdfParse = require('pdf-parse');
      const pdfData = await pdfParse(pdfBuffer);
      // If extracted text is very short or mostly empty, likely a scanned PDF
      const text = pdfData.text.trim();
      return text.length > 100; // Threshold for determining if PDF has text
    } catch (error) {
      console.error('Error checking text layer:', error);
      return false;
    }
  }

  /**
   * Extract images from PDF pages
   */
  static async extractImagesFromPDF(pdfPath, outputDir) {
    try {
      const { fromPath } = require('pdf2pic');
      
      const convert = fromPath(pdfPath, {
        density: 300,
        saveFilename: "page",
        savePath: outputDir,
        format: "png",
        width: 2000,
        height: 2000
      });

      const files = await fs.readdir(outputDir);
      const pdfFiles = files.filter(f => f.endsWith('.pdf'));
      const pageCount = pdfFiles.length;

      const imagePaths = [];
      for (let i = 1; i <= pageCount; i++) {
        const imagePath = await convert(i, { responseType: "image" });
        imagePaths.push(imagePath.path);
      }

      return imagePaths;
    } catch (error) {
      console.error('Error extracting images from PDF:', error);
      throw new Error('Failed to extract images from PDF');
    }
  }

  /**
   * Perform OCR on an image
   */
  static async performOCR(imagePath) {
    try {
      const { data } = await Tesseract.recognize(imagePath, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      return data.text;
    } catch (error) {
      console.error('OCR error:', error);
      throw new Error('Failed to perform OCR on image');
    }
  }

  /**
   * Process PDF with OCR fallback
   * Tries to extract text first, falls back to OCR if needed
   */
  static async processPDFWithOCR(pdfPath, pdfBuffer) {
    try {
      // First, try to extract text normally
      const hasText = await this.hasTextLayer(pdfBuffer);
      
      if (hasText) {
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(pdfBuffer);
        return {
          text: pdfData.text,
          method: 'text-extraction',
          isScanned: false
        };
      }

      // If no text layer found, use OCR
      console.log('No text layer detected, using OCR...');
      
      // Create temp directory for images
      const tempDir = path.join(__dirname, '../../temp', `ocr_${Date.now()}`);
      await fs.mkdir(tempDir, { recursive: true });

      try {
        // Extract images from PDF
        const imagePaths = await this.extractImagesFromPDF(pdfPath, tempDir);
        
        // Perform OCR on each page
        let allText = '';
        for (let i = 0; i < imagePaths.length; i++) {
          console.log(`Processing page ${i + 1}/${imagePaths.length} with OCR...`);
          const pageText = await this.performOCR(imagePaths[i]);
          allText += `\n\n--- Page ${i + 1} ---\n\n${pageText}`;
        }

        // Clean up temp images
        for (const imagePath of imagePaths) {
          try {
            await fs.unlink(imagePath);
          } catch (error) {
            console.error('Error deleting temp file:', error);
          }
        }

        return {
          text: allText,
          method: 'ocr',
          isScanned: true
        };
      } finally {
        // Clean up temp directory
        try {
          await fs.rmdir(tempDir);
        } catch (error) {
          console.error('Error cleaning up temp directory:', error);
        }
      }
    } catch (error) {
      console.error('PDF OCR processing error:', error);
      throw new Error('Failed to process PDF with OCR');
    }
  }

  /**
   * Check if image file needs OCR
   */
  static async processImageWithOCR(imagePath) {
    try {
      const text = await this.performOCR(imagePath);
      return {
        text: text,
        method: 'ocr',
        isScanned: true
      };
    } catch (error) {
      console.error('Image OCR processing error:', error);
      throw new Error('Failed to process image with OCR');
    }
  }
}

module.exports = OCRProcessor;

