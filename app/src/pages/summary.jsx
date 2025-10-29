import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import logo from '../assets/logo.png';
import bgImage from '../assets/bg.jpg';
import { useQuizGeneration, useFlashcardsGeneration } from '../hooks/useAI';
import backendAPI from '../services/backendApi';
import ProfileIcon from '../components/ProfileIcon';

export default function Summary() {
  const location = useLocation();
  const [summaryData, setSummaryData] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const navigate = useNavigate();
  const { generateQuiz, isGenerating } = useQuizGeneration();
  const { generateFlashcards, isGenerating: isGeneratingFlashcards } = useFlashcardsGeneration();
  
  const ensureJsPDF = async () => {
    if (window.jspdf || window.jsPDF) return window.jspdf || window.jsPDF;
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
    return window.jspdf || window.jsPDF;
  };

  const exportSummaryAsPDF = async () => {
    try {
      const data = summaryData || {};
      const jspdf = await ensureJsPDF();
      const { jsPDF } = jspdf;
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });

      const marginX = 56;
      const marginY = 64;
      const lineHeight = 18;
      const pageWidth = doc.internal.pageSize.getWidth();
      const maxTextWidth = pageWidth - marginX * 2;

      const addWrapped = (text, x, y, options = {}) => {
        const lines = doc.splitTextToSize(String(text || ''), maxTextWidth);
        lines.forEach(ln => { doc.text(ln, x, y, options); y += lineHeight; });
        return y;
      };

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text((data.title || 'Summary'), marginX, marginY);
      let cursorY = marginY + 28;

      // Summary body
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      const paragraphs = String(data.summary || '').split(/\n\n+/);
      paragraphs.forEach((p, idx) => {
        cursorY = addWrapped(p, marginX, cursorY);
        if (idx < paragraphs.length - 1) {
          cursorY += 8;
        }
        if (cursorY > doc.internal.pageSize.getHeight() - marginY - 40) {
          doc.addPage();
          cursorY = marginY;
        }
      });

      const fileName = `${(data.title || 'summary').replace(/[^a-z0-9-_]+/gi, '_')}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error('Export summary failed:', err);
      alert('Failed to export PDF.');
    }
  };

  useEffect(() => {
    // Add dark class to body
    document.body.classList.add('dark');
    
    const loadSummary = async () => {
      // Get documentId from navigation state or sessionStorage
      let docId = location.state?.documentId || location.state?.document?.id || location.state?.document?._id;
      if (!docId) {
        try {
          const stored = sessionStorage.getItem('lastDocumentId');
          if (stored) docId = stored;
        } catch {}
      }
      
      if (docId) {
        setDocumentId(docId);
        // Fetch summary from backend
        try {
          const res = await backendAPI.getSummary(docId);
          if (res.summary) {
            setSummaryData({
              title: res.summary.title || 'Summary',
              summary: res.summary.content || '',
              content: ''
            });
          } else {
            // No summary in DB, check if passed in state
            if (location.state?.summary) {
              setSummaryData({
                title: location.state.title || 'Summary',
                summary: location.state.summary || '',
                content: location.state.content || ''
              });
            } else {
              setSummaryData({
                title: 'Summary',
                summary: 'No summary available. Please generate a summary first.',
                content: ''
              });
            }
          }
        } catch (err) {
          console.error('Failed to load summary:', err);
          // Fallback to state if available
          if (location.state?.summary) {
            setSummaryData({
              title: location.state.title || 'Summary',
              summary: location.state.summary || '',
              content: location.state.content || ''
            });
          } else {
            setSummaryData({
              title: 'Summary',
              summary: 'No summary available. Please generate a summary first.',
              content: ''
            });
          }
        }
      } else if (location.state?.summary) {
        // Summary passed directly in state
        setSummaryData({
          title: location.state.title || 'Summary',
          summary: location.state.summary || '',
          content: location.state.content || ''
        });
      } else {
        // Default/empty
        setSummaryData({
          title: 'Summary',
          summary: 'No summary available.',
          content: ''
        });
      }
    };
    
    loadSummary();

    return () => {
      // Cleanup on unmount
      document.body.classList.remove('dark');
    };
  }, [location]);

  const handleGenerateQuiz = async () => {
    try {
      const docId = documentId || location.state?.documentId;
      if (!docId) {
        alert('Missing document context. Please generate from Upload page again.');
        return;
      }
      const res = await generateQuiz(docId, { questionCount: 10, difficulty: 'medium', title: summaryData?.title });
      navigate('/quiz', { state: { quiz: res, title: summaryData?.title } });
    } catch (err) {
      console.error('Generate Quiz from Summary failed:', err);
    }
  };

  const handleGenerateFlashcards = async () => {
    try {
      const docId = documentId || location.state?.documentId;
      if (!docId) {
        alert('Missing document context. Please generate from Upload page again.');
        return;
      }
      const res = await generateFlashcards(docId, { numCards: 24 });
      navigate('/flashcards', { state: { flashcards: res.cards, raw: res.raw, title: res.title || summaryData?.title, documentId: docId } });
    } catch (err) {
      console.error('Generate Flashcards from Summary failed:', err);
    }
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

      <div className="flex flex-col min-h-screen relative z-10">
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/10 border-b border-white/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                  <img src={logo} alt="NotesQuest" className="h-8 w-8 object-contain" />
                  <h1 className="font-sans text-xl font-bold text-white">NotesQuest</h1>
                </div>
                <nav className="hidden md:flex items-center gap-6">
                </nav>
                <div className="flex items-center gap-4">
                  <Link to="/upload" className="px-6 py-2 text-sm font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg hover:bg-white/30 transition-all duration-300">Home</Link>
                  <Link to="/history" className="px-6 py-2 text-sm font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg hover:bg-white/30 transition-all duration-300">History</Link>
                  <ProfileIcon />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center text-sm text-gray-300 mb-8">
                  <a className="font-sans hover:text-blue-400" href="#">Summaries</a>
                  <span className="mx-2">/</span>
                  <span className="font-sans font-medium text-white">Chapter 1 Summary</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
                    <div className="relative">
                      <h2 className="font-sans text-3xl md:text-4xl font-bold text-white mb-4">
                        {summaryData?.title || 'Summary'}
                      </h2>
                      <div className="text-base text-gray-300 leading-relaxed prose prose-invert prose-lg max-w-none">
                        <ReactMarkdown
                          components={{
                            h3: ({ node, ...props }) => (
                              <h3 className="text-2xl md:text-3xl font-bold text-white mt-6 mb-4 first:mt-0" {...props} />
                            ),
                            h4: ({ node, ...props }) => (
                              <h4 className="text-xl md:text-2xl font-bold text-white mt-5 mb-3" {...props} />
                            ),
                            h5: ({ node, ...props }) => (
                              <h5 className="text-lg md:text-xl font-bold text-white mt-4 mb-2" {...props} />
                            ),
                            h6: ({ node, ...props }) => (
                              <h6 className="text-base md:text-lg font-bold text-white mt-3 mb-2" {...props} />
                            ),
                            p: ({ node, ...props }) => (
                              <p className="text-gray-300 mb-4 leading-relaxed" {...props} />
                            ),
                            strong: ({ node, ...props }) => (
                              <strong className="font-bold text-white" {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2 ml-4" {...props} />
                            ),
                            ol: ({ node, ...props }) => (
                              <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2 ml-4" {...props} />
                            ),
                            li: ({ node, ...props }) => (
                              <li className="text-gray-300 leading-relaxed" {...props} />
                            ),
                          }}
                        >
                          {summaryData?.summary || 'No summary available.'}
                        </ReactMarkdown>
                      </div>
                      <div className="absolute -top-4 -right-4 size-12 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center opacity-50"><span className="material-symbols-outlined text-2xl">book</span></div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-end">
                      <button onClick={exportSummaryAsPDF} className="flex items-center justify-center gap-2 rounded-full h-11 px-5 font-sans text-sm font-medium bg-white text-gray-900 hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg"><span className="material-symbols-outlined text-base"> file_download </span><span>Export</span></button>
                    </div>
                  </div>
                </div>

                {/* Generate Actions */}
                <div className="mt-8 flex flex-wrap gap-4 justify-start">
                  <button onClick={handleGenerateQuiz} disabled={isGenerating || isGeneratingFlashcards} className="flex items-center justify-center gap-2 rounded-full h-12 px-8 font-sans text-base font-medium bg-white text-gray-900 hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none">
                    <span className="material-symbols-outlined text-xl">quiz</span>
                    <span>{isGenerating ? 'Generating…' : 'Generate Quiz'}</span>
                  </button>
                  <button onClick={handleGenerateFlashcards} disabled={isGenerating || isGeneratingFlashcards} className="flex items-center justify-center gap-2 rounded-full h-12 px-8 font-sans text-base font-medium bg-white text-gray-900 hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none">
                    <span className="material-symbols-outlined text-xl">style</span>
                    <span>{isGeneratingFlashcards ? 'Generating…' : 'Generate Flashcards'}</span>
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
  );
}