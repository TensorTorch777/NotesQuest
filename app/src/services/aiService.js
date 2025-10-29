import config from '../config/config';

// AI Service for NotesQuest - Using Llama API with SLM technique
class AIService {
  constructor() {
    this.apiKey = config.LLAMA_API_KEY;
    this.baseURL = config.LLAMA_API_URL;
    this.model = config.LLAMA_MODEL;
  }

  // Generic method to call Llama API
  async callLlamaAPI(prompt, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: options.systemPrompt || 'You are an intelligent assistant that helps students learn by creating summaries and quizzes from educational content.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.9,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Llama API Error:', error);
      throw new Error(`AI Service Error: ${error.message}`);
    }
  }

  // Extract text from uploaded file
  async extractTextFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target.result;
        
        if (file.type === 'application/pdf') {
          // For PDF files, we'll use a simple text extraction
          // In production, you might want to use a PDF parsing library
          resolve(this.extractTextFromPDF(content));
        } else if (file.type === 'text/plain') {
          resolve(content);
        } else {
          reject(new Error('Unsupported file type'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Simple PDF text extraction (basic implementation)
  extractTextFromPDF(pdfContent) {
    // This is a basic implementation - in production, use a proper PDF library
    // For now, we'll assume the PDF content is already text-extracted
    return pdfContent;
  }

  // Generate AI-powered summary
  async generateSummary(content, options = {}) {
    const prompt = `
Please create a comprehensive summary of the following educational content. The summary should:

1. Capture the main concepts and key points
2. Be structured and easy to read
3. Include important details that students need to know
4. Be approximately 200-300 words
5. Use clear, academic language

Content to summarize:
${content}

Please provide a well-structured summary that students can use for studying.
`;

    const systemPrompt = `You are an expert educational content summarizer. Create clear, comprehensive summaries that help students understand and retain key information. Focus on the most important concepts and present them in a logical, easy-to-follow structure.`;

    try {
      const summary = await this.callLlamaAPI(prompt, {
        systemPrompt,
        maxTokens: 500,
        temperature: 0.3 // Lower temperature for more consistent summaries
      });

      return {
        id: this.generateId(),
        content: summary,
        originalContent: content,
        createdAt: new Date().toISOString(),
        wordCount: summary.split(' ').length,
        type: 'summary'
      };
    } catch (error) {
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }

  // Generate AI-powered quiz questions
  async generateQuiz(content, options = {}) {
    const { questionCount = 5, difficulty = 'medium' } = options;
    
    const prompt = `
Create a ${difficulty} difficulty quiz with ${questionCount} questions based on the following educational content. 

Requirements:
1. Mix of multiple choice and short answer questions
2. Questions should test understanding, not just memorization
3. Include correct answers and explanations
4. Make questions challenging but fair
5. Cover the most important concepts from the content

Content:
${content}

Please format your response as JSON with the following structure:
{
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice" | "short_answer",
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"] (only for multiple choice),
      "correctAnswer": "Correct answer",
      "explanation": "Explanation of why this is correct"
    }
  ]
}
`;

    const systemPrompt = `You are an expert quiz creator. Generate educational quizzes that test students' understanding of the material. Create questions that are clear, fair, and educational. Always provide the response in valid JSON format.`;

    try {
      const response = await this.callLlamaAPI(prompt, {
        systemPrompt,
        maxTokens: 1500,
        temperature: 0.5
      });

      // Parse the JSON response
      const quizData = JSON.parse(response);
      
      return {
        id: this.generateId(),
        title: `Quiz: ${options.title || 'Generated Quiz'}`,
        questions: quizData.questions,
        originalContent: content,
        createdAt: new Date().toISOString(),
        difficulty,
        questionCount: quizData.questions.length,
        type: 'quiz'
      };
    } catch (error) {
      throw new Error(`Failed to generate quiz: ${error.message}`);
    }
  }

  // Analyze quiz performance and provide feedback
  async analyzeQuizPerformance(quiz, userAnswers) {
    const prompt = `
Analyze the following quiz performance and provide educational feedback:

Quiz Questions: ${JSON.stringify(quiz.questions)}
User Answers: ${JSON.stringify(userAnswers)}

Please provide:
1. Overall performance assessment
2. Areas of strength
3. Areas for improvement
4. Study recommendations
5. Encouraging feedback

Format as JSON:
{
  "score": percentage,
  "correctAnswers": number,
  "totalQuestions": number,
  "feedback": "Overall feedback message",
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1", "area2"],
  "recommendations": ["recommendation1", "recommendation2"]
}
`;

    try {
      const response = await this.callLlamaAPI(prompt, {
        maxTokens: 800,
        temperature: 0.4
      });

      const analysis = JSON.parse(response);
      
      return {
        ...analysis,
        quizId: quiz.id,
        completedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to analyze quiz performance: ${error.message}`);
    }
  }

  // Generate study recommendations
  async generateStudyRecommendations(content, performance) {
    const prompt = `
Based on the following content and performance data, provide personalized study recommendations:

Content: ${content}
Performance: ${JSON.stringify(performance)}

Provide specific, actionable study recommendations that will help improve understanding and retention.
`;

    try {
      const recommendations = await this.callLlamaAPI(prompt, {
        maxTokens: 600,
        temperature: 0.6
      });

      return {
        recommendations,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to generate study recommendations: ${error.message}`);
    }
  }

  // Utility function to generate unique IDs
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Validate API key
  async validateAPIKey() {
    try {
      await this.callLlamaAPI('Hello', { maxTokens: 10 });
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
const aiService = new AIService();

export default aiService;
