import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDocumentProcessing, useSummaryGeneration, useQuizGeneration, useFlashcardsGeneration } from '../hooks/useAI';
import { useApp } from '../context/AppContext';
import logo from '../assets/logo.png';
import bgImage from '../assets/bg.jpg';
import backendAPI from '../services/backendApi';
import ProfileIcon from '../components/ProfileIcon';

export default function Upload() {
  const navigate = useNavigate();
  const { state } = useApp();
  
  // AI Hooks
  const { processDocument, isProcessing: isProcessingDoc, error: docError } = useDocumentProcessing();
  const { generateSummary, isGenerating: isGeneratingSummary, error: summaryError } = useSummaryGeneration();
  const { generateQuiz, isGenerating: isGeneratingQuiz, error: quizError } = useQuizGeneration();
  const { generateFlashcards, isGenerating: isGeneratingFlashcards, error: flashcardsError } = useFlashcardsGeneration();
  
  // State management
  const [selectedType, setSelectedType] = useState(null); // 'summary', 'quiz', 'flashcards'
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);

  // Combined loading state
  const isLoading = isProcessingDoc || isGeneratingSummary || isGeneratingQuiz || isGeneratingFlashcards;
  
  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await backendAPI.getCurrentUser();
          if (response.success && response.user) {
            setUser(response.user);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
        // Silently fail - user might not be logged in
      }
    };
    
    fetchUser();
  }, []);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Debug loading states
  useEffect(() => {
    console.log('Loading states:', { isProcessingDoc, isGeneratingSummary, isGeneratingQuiz, isGeneratingFlashcards, isLoading });
  }, [isProcessingDoc, isGeneratingSummary, isGeneratingQuiz, isGeneratingFlashcards, isLoading]);

  const handleGenerateFlashcards = async () => {
    try {
      console.log('Generate Flashcards clicked');
      setError(null);

      if (!selectedFile) {
        alert('Kindly upload the document to generate flashcards.');
        return;
      }

      let document = null;
      const title = selectedFile.name.replace(/\.[^/.]+$/, "") || 'Untitled Document';

      if (selectedFile) {
        document = await processDocument(selectedFile, { title });
      }

      console.log('Generating flashcards...', { documentId: document?.id || document?._id });
      const docId = document.id || document._id;
      const result = await generateFlashcards(docId, { numCards: 24 });

      try { sessionStorage.setItem('lastDocumentId', docId); } catch {}

      navigate('/flashcards', { state: { flashcards: result.cards, raw: result.raw, title: result.title, documentId: docId, document } });
    } catch (err) {
      console.error('Generate Flashcards error:', err);
      setError(err.message);
    }
  };
  
  // Combined error state
  const currentError = error || docError || summaryError;

  // Debug: Log AI configuration
  useEffect(() => {
    // Add dark class to body
    document.body.classList.add('dark');
    
    console.log('AI Configuration:', {
      hasApiKey: !!import.meta.env.VITE_LLAMA_API_KEY,
      apiKeyLength: import.meta.env.VITE_LLAMA_API_KEY?.length || 0,
      apiUrl: import.meta.env.VITE_LLAMA_API_URL || 'https://api.llama.ai/v1',
      model: import.meta.env.VITE_LLAMA_MODEL || 'llama-3.3-8b-instruct',
      isDefaultKey: import.meta.env.VITE_LLAMA_API_KEY === 'your-llama-api-key-here'
    });
    
    return () => {
      // Cleanup on unmount
      document.body.classList.remove('dark');
    };
  }, []);

  // Handle file selection
  const handleFileSelect = (file) => {
    if (file && (file.type === 'application/pdf' || file.type === 'text/plain')) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please upload a PDF or text file only.');
    }
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Real AI processing function
  const handleProcessDocument = async (target) => {
    try {
      setError(null);
      
      let document = null;
      let content = '';
      let title = documentTitle || 'Untitled Document';

      if (uploadMethod === 'file' && selectedFile) {
        // Process uploaded file with AI
        document = await processDocument(selectedFile, { title });
        content = document.content;
        title = document.title;
      } else if (uploadMethod === 'text' && textContent.trim()) {
        // Process pasted text with AI
        document = await processDocument(textContent, { title });
        content = document.content;
        title = document.title;
      } else {
        setError('Please upload a file or paste some content.');
        return;
      }

      // Navigate to progress page with AI-generated content
      navigate('/progress', { 
        state: { 
          target, 
          content, 
          title,
          documentId: document?.id,
          document: document
        } 
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle type selection and auto-generate
  const handleTypeSelection = (type) => {
    setSelectedType(type);
    setError(null);
    // Clear previous uploads when switching types
    clearForm();
  };

  // Generate based on selected type
  const handleGenerate = async () => {
    if (!selectedType) return;
    
    if (selectedType === 'summary') {
      await handleGenerateSummary();
    } else if (selectedType === 'quiz') {
      await handleGenerateQuiz();
    } else if (selectedType === 'flashcards') {
      await handleGenerateFlashcards();
    }
  };

  // Generate summary
  const handleGenerateSummary = async () => {
    try {
      console.log('Generate Summary clicked');
      setError(null);
      
      // Check if content is available
      if (!selectedFile) {
        alert('Kindly upload the document to generate a summary.');
        return;
      }
      
      console.log('Content available, processing...');
      let document = null;
      let content = '';
      const title = selectedFile.name.replace(/\.[^/.]+$/, "") || 'Untitled Document';

      if (selectedFile) {
        document = await processDocument(selectedFile, { title });
        content = document.content;
      }

      console.log('Upload complete, generating summary...');
      
      // Generate summary using the uploaded document
      const summary = await generateSummary(document.id || document._id, { 
        maxLength: 500 
      });
      
      console.log('Summary generated, navigating to summary page');
      
      // Navigate to summary page with generated summary
      navigate('/summary', { 
        state: { 
          summary: summary.summary,
          title: title,
          content: content,
          documentId: document.id || document._id
        } 
      });
    } catch (err) {
      console.error('Summary generation error:', err);
      setError(err.message);
    }
  };

  // Generate quiz
  const handleGenerateQuiz = async () => {
    try {
      console.log('Generate Quiz clicked');
      setError(null);
      
      // Check if content is available
      if (!selectedFile) {
        alert('Kindly upload the document to generate a quiz.');
        return;
      }
      
      console.log('Content available, processing...');
      let document = null;
      let content = '';
      const title = selectedFile.name.replace(/\.[^/.]+$/, "") || 'Untitled Document';

      if (selectedFile) {
        document = await processDocument(selectedFile, { title });
        content = document.content;
      }

      console.log('Generating quiz...', { documentId: document?.id || document?._id, document });
      
      // Generate quiz directly
      const quiz = await generateQuiz(document.id || document._id, { questionCount: 5 });
      
      console.log('Quiz generated successfully:', quiz);
      
      // Navigate directly to quiz page
      navigate('/quiz', { 
        state: { 
          quiz,
          title
        } 
      });
    } catch (err) {
      console.error('Quiz generation error:', err);
      setError(err.message);
    }
  };


  // Test function to verify button clicks work
  const testButtonClick = () => {
    console.log('TEST BUTTON CLICKED - This should work!');
    alert('Test button works!');
  };

  // Generate mock flashcards based on content
  const generateMockFlashcards = (content, title) => {
    return [
      {
        id: 1,
        front: `What is the main topic of "${title}"?`,
        back: `The main topic is ${title.toLowerCase()}, which covers key concepts and important information.`,
        difficulty: "easy",
        category: "Overview"
      },
      {
        id: 2,
        front: "What are the key concepts discussed?",
        back: "The key concepts include fundamental principles, important definitions, and practical applications.",
        difficulty: "medium",
        category: "Concepts"
      },
      {
        id: 3,
        front: "What are the main takeaways?",
        back: "The main takeaways include understanding the core principles and their practical applications.",
        difficulty: "hard",
        category: "Analysis"
      },
      {
        id: 4,
        front: "How can this knowledge be applied?",
        back: "This knowledge can be applied in real-world scenarios and practical situations.",
        difficulty: "medium",
        category: "Application"
      },
      {
        id: 5,
        front: "What are the important details to remember?",
        back: "Important details include specific facts, figures, and examples that support the main concepts.",
        difficulty: "hard",
        category: "Details"
      }
    ];
  };

  // Test AI connection
  const testAIConnection = async () => {
    try {
      setError(null);
      console.log('Testing AI connection...');
      
      // Check if API key is configured
      if (!import.meta.env.VITE_LLAMA_API_KEY || import.meta.env.VITE_LLAMA_API_KEY === 'your-llama-api-key-here') {
        throw new Error('Llama API key not configured. Please add VITE_LLAMA_API_KEY to your .env file.');
      }
      
      // Simple test with minimal content
      const testContent = "This is a test document about machine learning.";
      const result = await processDocument(testContent, { title: 'Test Document' });
      
      console.log('AI Test Result:', result);
      alert('AI connection successful! Check console for details.');
    } catch (err) {
      console.error('AI Test Error:', err);
      setError(`AI Test Failed: ${err.message}`);
    }
  };

  // Clear form
  const clearForm = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Reset selection
  const resetSelection = () => {
    console.log('Resetting selection...');
    setSelectedType(null);
    clearForm();
    setError(null);
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})`, zIndex: 0 }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/60"></div>
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-yellow-500/20 to-orange-500/20 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-purple-500/20 via-blue-500/20 to-green-500/20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 animate-pulse" style={{ animationDelay: '2s' }}></div>
          {/* Swirling patterns */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-400/30 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
            <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-yellow-400/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>

      {/* Transparent Header */}
      <header className="sticky top-0 backdrop-blur-xl bg-white/10 border-b border-white/20" style={{ zIndex: 20 }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={logo} alt="NotesQuest" className="h-8 w-8 object-contain" />
              <h1 className="text-xl font-bold text-white">NotesQuest</h1>
            </div>
            <nav className="hidden md:flex items-center gap-8">
            </nav>
            <div className="flex items-center gap-4">
              <Link to="/history" className="px-6 py-2 text-sm font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg hover:bg-white/30 transition-all duration-300">History</Link>
              <ProfileIcon />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative" style={{ zIndex: 10 }}>
        <div className="w-full max-w-6xl space-y-12">
            {/* Personalized Greeting */}
            {user?.firstName && (
              <div className="text-center mb-8">
                <h1 className="text-5xl sm:text-6xl font-bold text-white mb-2">
                  {getGreeting()}, {user.firstName}
                </h1>
              </div>
            )}

            <div className="text-center">
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">What would you like to create?</h2>
              <p className="mt-4 text-lg text-gray-300">Choose an option to get started with AI-powered content generation</p>
            </div>

            {/* Type Selection Cards */}
            {!selectedType && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Summary Card */}
                <button
                  onClick={() => handleTypeSelection('summary')}
                  className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 p-8 hover:bg-white/15 hover:scale-[1.02] transition-all duration-300 text-left shadow-2xl"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-600/30 rounded-full flex items-center justify-center group-hover:bg-blue-600/50 transition-colors">
                      <span className="material-symbols-outlined text-4xl text-blue-300">summarize</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Summary</h3>
                    <p className="text-gray-300 text-sm">Get a comprehensive summary of your document with key points and insights</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>

                {/* Quiz Card */}
                <button
                  onClick={() => handleTypeSelection('quiz')}
                  className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 p-8 hover:bg-white/15 hover:scale-[1.02] transition-all duration-300 text-left shadow-2xl"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-purple-600/30 rounded-full flex items-center justify-center group-hover:bg-purple-600/50 transition-colors">
                      <span className="material-symbols-outlined text-4xl text-purple-300">quiz</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Quiz</h3>
                    <p className="text-gray-300 text-sm">Generate exam-quality multiple choice questions to test your understanding</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>

                {/* Flashcards Card */}
                <button
                  onClick={() => handleTypeSelection('flashcards')}
                  className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 p-8 hover:bg-white/15 hover:scale-[1.02] transition-all duration-300 text-left shadow-2xl"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-green-600/30 rounded-full flex items-center justify-center group-hover:bg-green-600/50 transition-colors">
                      <span className="material-symbols-outlined text-4xl text-green-300">style</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Flashcards</h3>
                    <p className="text-gray-300 text-sm">Create interactive flashcards for active recall and better memorization</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>

                {/* Chat Card */}
                <button
                  onClick={() => navigate('/chat')}
                  className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 p-8 hover:bg-white/15 hover:scale-[1.02] transition-all duration-300 text-left shadow-2xl"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-orange-600/30 rounded-full flex items-center justify-center group-hover:bg-orange-600/50 transition-colors">
                      <span className="material-symbols-outlined text-4xl text-orange-300">chat</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Chat</h3>
                    <p className="text-gray-300 text-sm">Have a conversation with AI assistant</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>
            )}

            {/* Upload Section - Only show when type is selected */}
            {selectedType && (
              <>
                {/* Selected Type Header */}
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {selectedType === 'summary' && '📄 Generate Summary'}
                      {selectedType === 'quiz' && '❓ Generate Quiz'}
                      {selectedType === 'flashcards' && '🃏 Generate Flashcards'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">Upload your document to get started</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Choose Different button clicked!');
                      setSelectedType(null);
                      clearForm();
                    }}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer relative z-50"
                    style={{ pointerEvents: 'auto', position: 'relative' }}
                  >
                    ← Choose Different
                  </button>
                </div>

                {/* Error Display */}
                {currentError && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <span className="material-symbols-outlined text-red-400">error</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-300">{currentError}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 space-y-8 shadow-2xl">
              {/* File Upload Section */}
              <div 
                  className={`relative flex justify-center rounded-2xl border-2 border-dashed px-6 py-14 transition-colors ${
                    dragActive 
                      ? 'border-blue-400/50 bg-blue-400/10' 
                      : 'border-white/30 hover:border-blue-400/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-400">upload_file</span>
                    <div className="mt-4 flex text-sm leading-6 text-gray-300">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-sans font-medium text-blue-400 hover:text-blue-300">
                        <span>Upload a file</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleFileInputChange}
                          accept=".pdf,.txt"
                          className="sr-only" 
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-400">PDF or TXT files up to 10MB</p>
                    {selectedFile && (
                      <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                        <p className="text-sm text-green-300">
                          <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
                          {selectedFile.name} selected
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Clear Button */}
              {selectedFile && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={clearForm}
                    className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    Clear file
                  </button>
                </div>
              )}
                </div>

                {/* Generate Button - Specific to selected type */}
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isLoading || !selectedFile}
                    className="w-full flex justify-center items-center py-4 px-6 bg-white text-gray-900 font-bold rounded-full hover:bg-white/90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin mr-2">refresh</span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined mr-2">
                          {selectedType === 'summary' && 'summarize'}
                          {selectedType === 'quiz' && 'quiz'}
                          {selectedType === 'flashcards' && 'style'}
                        </span>
                        {selectedType === 'summary' && 'Generate Summary'}
                        {selectedType === 'quiz' && 'Generate Quiz'}
                        {selectedType === 'flashcards' && 'Generate Flashcards'}
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
    </div>
  );
}