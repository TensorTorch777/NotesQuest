// src/pages/History.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from '../assets/logo.png';
import bgImage from '../assets/bg.jpg';
import backendAPI from '../services/backendApi';
import ProfileIcon from '../components/ProfileIcon';

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  useEffect(() => {
    // Add dark class to body
    document.body.classList.add('dark');
    (async () => {
      try {
        // Try history endpoint first (no auth), fallback to my-documents
        let res;
        try {
          res = await backendAPI.getHistory();
          console.log('📋 Loaded from /history endpoint');
        } catch (e) {
          console.log('⚠️ /history failed, trying /my-documents');
          res = await backendAPI.getMyDocuments();
        }
        
        // Ensure IDs are strings and log for debugging
        const rawDocs = res.documents || [];
        const documents = rawDocs.map((doc, index) => {
          const id = String(doc.id || doc._id);
          if (id.length !== 24) {
            console.warn(`⚠️ Document "${doc.title}" has ID length ${id.length}: ${id}`);
          }
          const normalizedId = id.length > 24 ? id.substring(0, 24) : id;
          
          // Log first 3 documents for debugging
          if (index < 3) {
            console.log(`📄 Document: "${doc.title}" | ID: ${normalizedId} | Length: ${normalizedId.length}`);
          }
          
          return {
            ...doc,
            id: normalizedId
          };
        });
        
        setItems(documents);
        console.log(`✅ Loaded ${documents.length} documents`);
        // Log sample IDs for debugging
        if (documents.length > 0) {
          console.log(`📋 Sample IDs:`, documents.slice(0, 3).map(d => d.id));
        }
      } catch (e) {
        console.error('Failed to load history:', e);
      } finally {
        setLoading(false);
      }
    })();
    
    return () => {
      // Cleanup on unmount
      document.body.classList.remove('dark');
    };
  }, []);

  const handleDelete = async (documentId, event) => {
    event.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this document? This will delete all associated summaries, quizzes, and flashcards.')) {
      return;
    }

    try {
      // Ensure documentId is a string and extract only the first 24 characters (MongoDB ObjectId length)
      let id = String(documentId).trim();
      console.log('🗑️ Original document ID:', id, 'length:', id.length);
      
      // If ID is longer than 24 chars, it might be concatenated - take first 24
      if (id.length > 24) {
        console.warn(`⚠️ ID is ${id.length} chars, extracting first 24 characters`);
        id = id.substring(0, 24);
      }
      
      // Validate format (MongoDB ObjectId is exactly 24 hex characters)
      if (!id || id.length !== 24 || !/^[0-9a-fA-F]{24}$/i.test(id)) {
        console.error('❌ Invalid document ID format:', id);
        throw new Error(`Invalid document ID format: ${id.length} characters (expected 24)`);
      }
      
      console.log('🗑️ Deleting document with ID:', id);
      await backendAPI.deleteDocument(id);
      // Remove the item from the list
      setItems(prevItems => {
        const filtered = prevItems.filter(item => {
          const itemId = String(item.id);
          // Handle both full ID and first 24 chars
          const itemIdShort = itemId.length > 24 ? itemId.substring(0, 24) : itemId;
          return itemIdShort !== id;
        });
        console.log(`✅ Removed item, ${prevItems.length} -> ${filtered.length} items`);
        return filtered;
      });
      setOpenMenuId(null);
    } catch (error) {
      console.error('Failed to delete document:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete document. Please try again.';
      alert(errorMessage);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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

      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/10 border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/upload" className="flex items-center gap-2 text-white">
                <img src={logo} alt="NotesQuest" className="h-8 w-8 object-contain" />
                <span className="text-xl font-sans font-bold">NotesQuest</span>
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <Link to="/upload" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Home</Link>
                <Link to="/upload" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Upload</Link>
                <Link to="/history" className="text-sm font-bold text-white">History</Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <ProfileIcon />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-4xl font-sans font-bold text-white">Past Results</h1>
              <p className="mt-2 text-lg text-gray-300">Your generated summaries and quizzes, all in one place.</p>
            </div>

            <div className="space-y-4">
              {!loading && items.length > 0 && items.map((d, idx) => (
                <div key={d.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300 overflow-hidden shadow-2xl">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <h2 className="text-xl font-sans font-medium text-white">{d.title}</h2>
                        <p className="text-sm text-gray-400 mt-1">{new Date(d.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 relative">
                        {/* 3-dot menu */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === d.id ? null : d.id);
                            }}
                            className="p-2 rounded-full hover:bg-white/20 transition-colors"
                          >
                            <span className="material-symbols-outlined text-white text-xl">more_vert</span>
                          </button>
                          {openMenuId === d.id && (
                            <div className="absolute right-0 top-10 z-50 backdrop-blur-xl bg-white/20 border border-white/30 rounded-lg shadow-2xl min-w-[120px]">
                              <button
                                onClick={(e) => handleDelete(d.id, e)}
                                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-red-500/30 transition-colors flex items-center gap-2 rounded-lg"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                        {d.hasSummary ? (
                          <Link to={`/summary`} state={{ documentId: d.id }} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-white text-gray-900 rounded-full hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg">
                            <span className="material-symbols-outlined text-base">description</span>
                            Summary
                          </Link>
                        ) : (
                          <button disabled className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 backdrop-blur-sm bg-white/5 border border-white/10 rounded-full cursor-not-allowed opacity-50">
                            <span className="material-symbols-outlined text-base">description</span>
                            Summary
                          </button>
                        )}
                        {d.hasQuiz ? (
                          <Link to={`/quiz`} state={{ documentId: d.id }} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-white text-gray-900 rounded-full hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg">
                            <span className="material-symbols-outlined text-base">quiz</span>
                            Quiz
                          </Link>
                        ) : (
                          <button disabled className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 backdrop-blur-sm bg-white/5 border border-white/10 rounded-full cursor-not-allowed opacity-50">
                            <span className="material-symbols-outlined text-base">quiz</span>
                            Quiz
                          </button>
                        )}
                        {d.hasFlashcards ? (
                          <Link to={`/flashcards`} state={{ documentId: d.id }} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-white text-gray-900 rounded-full hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg">
                            <span className="material-symbols-outlined text-base">style</span>
                            Flashcards
                          </Link>
                        ) : (
                          <button disabled className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 backdrop-blur-sm bg-white/5 border border-white/10 rounded-full cursor-not-allowed opacity-50">
                            <span className="material-symbols-outlined text-base">style</span>
                            Flashcards
                          </button>
                        )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`h-1 ${idx % 4 === 0 ? 'bg-blue-500' : idx % 4 === 1 ? 'bg-purple-500' : idx % 4 === 2 ? 'bg-green-500' : 'bg-teal-500'}`} />
                </div>
              ))}
              {!loading && items.length === 0 && (
                <div className="text-center text-gray-400 py-12">
                  <p>No documents yet. Upload a file to get started!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
