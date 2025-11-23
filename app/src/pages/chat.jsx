import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import bgImage from '../assets/bg.jpg';
import backendAPI from '../services/backendApi';

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingTitle, setEditingTitle] = useState(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentThinking, setCurrentThinking] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // User fetching removed - no login required
  useEffect(() => {
    // No user fetching needed
  }, []);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, []);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Load specific chat if chatId in location state
  useEffect(() => {
    if (location.state?.chatId && location.state.chatId !== currentChatId) {
      loadChat(location.state.chatId);
    }
  }, [location.state]);

  // Scroll to bottom when new messages arrive or streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage, currentThinking]);

  const loadChats = async () => {
    try {
      setIsLoadingChats(true);
      console.log('📋 Loading chats...');
      const response = await backendAPI.getChats();
      console.log('📋 Chat API response:', response);
      console.log('📋 Loaded chats:', response.chats?.length || 0);
      
      if (response && response.success && Array.isArray(response.chats)) {
        setChats(response.chats);
        console.log('✅ Chats set in state:', response.chats.length);
      } else {
        console.warn('⚠️ Unexpected response format:', response);
        setChats([]);
      }
    } catch (error) {
      console.error('❌ Failed to load chats:', error);
      setChats([]);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const loadChat = async (chatId) => {
    try {
      setIsLoading(true);
      const response = await backendAPI.getChat(chatId);
      if (response.chat) {
        setCurrentChatId(chatId);
        // Map messages to include thinking field
        const mappedMessages = (response.chat.messages || []).map(msg => ({
          id: Date.now() + Math.random(),
          role: msg.role,
          content: msg.content,
          thinking: msg.thinking || null,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
        }));
        setMessages(mappedMessages);
        // Update chat in list
        setChats(prev => prev.map(c => 
          c.id === chatId ? { ...c, title: response.chat.title } : c
        ));
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await backendAPI.createChat('New Chat');
      if (response.chat) {
        setCurrentChatId(null);
        setMessages([]);
        await loadChats();
        // Load the new empty chat
        setCurrentChatId(response.chat.id);
        inputRef.current?.focus();
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  // Streaming effect to show text appearing gradually
  const streamText = (fullText, onComplete) => {
    setIsStreaming(true);
    setStreamingMessage('');
    
    let currentIndex = 0;
    const words = fullText.split(' ');
    let currentWordIndex = 0;
    
    const streamInterval = setInterval(() => {
      if (currentWordIndex < words.length) {
        // Add words in chunks for more natural streaming
        const chunkSize = Math.random() > 0.7 ? 3 : 2; // Sometimes add 3 words, usually 2
        const wordsToAdd = words.slice(currentWordIndex, currentWordIndex + chunkSize);
        setStreamingMessage(prev => {
          const newText = prev + (prev ? ' ' : '') + wordsToAdd.join(' ');
          return newText;
        });
        currentWordIndex += wordsToAdd.length;
      } else {
        clearInterval(streamInterval);
        setIsStreaming(false);
        setStreamingMessage('');
        if (onComplete) onComplete();
      }
    }, 25); // Slightly faster for longer responses
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading || isStreaming) return;

    const userMessageText = inputMessage.trim();
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessageText,
      timestamp: new Date()
    };

    // If no current chat, create one IMMEDIATELY (before sending message)
    let chatIdToUse = currentChatId;
    if (!chatIdToUse) {
      try {
        console.log('✨ Creating new chat for first message...');
        const newChatResponse = await backendAPI.createChat(userMessageText.slice(0, 50) + (userMessageText.length > 50 ? '...' : ''));
        if (newChatResponse.chat) {
          chatIdToUse = newChatResponse.chat.id;
          setCurrentChatId(chatIdToUse);
          
          // Optimistically add to sidebar immediately
          const newChat = {
            id: chatIdToUse,
            title: newChatResponse.chat.title,
            createdAt: newChatResponse.chat.createdAt,
            updatedAt: newChatResponse.chat.updatedAt,
            messageCount: 0
          };
          setChats(prev => [newChat, ...prev]);
          console.log('✅ New chat created and added to sidebar:', chatIdToUse);
        }
      } catch (chatError) {
        console.error('❌ Failed to create chat:', chatError);
        // Continue anyway - chat will be created when saving
      }
    }

    // Optimistically update UI
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare history for API (excluding the welcome message)
      const historyMessages = messages
        .filter(m => m.role !== 'system')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Use streaming API for real-time token display
      setIsThinking(true);
      setIsStreaming(true);
      setCurrentThinking('');
      setStreamingMessage('');
      let finalThinking = '';
      let finalMessage = '';

      try {
        const result = await backendAPI.chatStream(
          userMessageText,
          historyMessages,
          chatIdToUse, // Use the chat ID we just created (or existing one)
          // onToken callback - called for each message token
          (token, text) => {
            setStreamingMessage(text);
            finalMessage = text;
          },
          // onThinkingToken callback - called for each thinking token
          (token, text) => {
            setCurrentThinking(text);
            finalThinking = text;
          }
        );

        // After streaming completes - finalize IMMEDIATELY (don't wait for anything)
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: result.message || finalMessage,
          thinking: result.thinking || finalThinking || null,
          timestamp: new Date()
        };
        
        // Update state immediately - streaming is done
        setIsThinking(false);
        setIsStreaming(false);
        setIsLoading(false); // Enable input immediately
        setCurrentThinking('');
        setStreamingMessage('');
        setMessages([...updatedMessages, assistantMessage]);

        // Save to backend asynchronously in background (completely non-blocking)
        // Use setTimeout to ensure it runs after state updates
        setTimeout(async () => {
          try {
            console.log('💾 Saving chat to database...', {
              chatId: chatIdToUse,
              messageLength: (result.message || finalMessage).length,
              thinkingLength: (result.thinking || finalThinking || '').length,
              userMessage: userMessageText
            });
            
            const saveResponse = await backendAPI.saveChat(
              chatIdToUse, // Use the chat ID we have (created or existing)
              result.message || finalMessage,
              result.thinking || finalThinking || null,
              userMessageText // Use the saved user message text
            );
            
            console.log('✅ Chat saved successfully:', saveResponse);
            
            if (saveResponse.chatId) {
              // Update currentChatId if changed
              if (saveResponse.chatId !== chatIdToUse) {
                setCurrentChatId(saveResponse.chatId);
              }
              
              // Update the chat in the sidebar list
              setChats(prev => prev.map(chat => 
                chat.id === chatIdToUse || chat.id === saveResponse.chatId
                  ? {
                      ...chat,
                      id: saveResponse.chatId,
                      title: saveResponse.chat?.title || chat.title,
                      updatedAt: saveResponse.chat?.updatedAt || new Date(),
                      messageCount: saveResponse.chat?.messages?.length || chat.messageCount
                    }
                  : chat
              ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
              
              console.log('✅ Chat list updated in sidebar');
            }
          } catch (saveError) {
            console.error('❌ Failed to save chat (non-blocking):', saveError);
            // Don't block UI - user already sees the message
          }
        }, 100); // Small delay to ensure state is updated

      } catch (streamError) {
        // Fallback to non-streaming if SSE fails
        console.warn('Streaming failed, falling back to regular chat:', streamError);
        setIsThinking(false);
        setIsStreaming(false);
        
        const response = await backendAPI.chat(userMessageText, historyMessages, chatIdToUse);
        const fullResponse = response.message || response.content || 'Sorry, I couldn\'t generate a response.';
        const thinking = response.thinking || response.thought || null;
        
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: fullResponse,
          thinking: thinking,
          timestamp: new Date()
        };
        setMessages([...updatedMessages, assistantMessage]);
        setIsLoading(false);

        if (response.chatId) {
          setCurrentChatId(response.chatId);
          // Update sidebar with the new chat
          setChats(prev => {
            const existingChat = prev.find(c => c.id === response.chatId);
            if (!existingChat) {
              // Add new chat if not already in list
              return [{
                id: response.chatId,
                title: response.chat?.title || userMessageText.slice(0, 50) + '...',
                createdAt: response.chat?.createdAt || new Date(),
                updatedAt: response.chat?.updatedAt || new Date(),
                messageCount: response.chat?.messages?.length || 0
              }, ...prev];
            }
            return prev.map(chat => 
              chat.id === response.chatId
                ? { ...chat, title: response.chat?.title || chat.title, updatedAt: response.chat?.updatedAt || chat.updatedAt }
                : chat
            ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          });
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setIsStreaming(false);
      setStreamingMessage('');
      setIsThinking(false);
      setCurrentThinking('');
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Error: ${error.message || 'Failed to get response. Please try again.'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // Only set loading to false if not already set by streaming completion
      if (isLoading) {
        setIsLoading(false);
      }
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.focus();
      }
    }
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this chat?')) return;

    try {
      await backendAPI.deleteChat(chatId);
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setMessages([]);
      }
      await loadChats();
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const handleStartEditTitle = (chat, e) => {
    e.stopPropagation();
    setEditingTitle(chat.id);
    setEditTitleValue(chat.title);
  };

  const handleSaveTitle = async (chatId, e) => {
    e.stopPropagation();
    if (!editTitleValue.trim()) return;

    try {
      await backendAPI.updateChatTitle(chatId, editTitleValue.trim());
      setChats(prev => prev.map(c => 
        c.id === chatId ? { ...c, title: editTitleValue.trim() } : c
      ));
      setEditingTitle(null);
    } catch (error) {
      console.error('Failed to update title:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingTitle(null);
    setEditTitleValue('');
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  // Markdown renderer with styling for headings and bold
  const Markdown = ({ content }) => (
    <ReactMarkdown
      components={{
        h1: ({ node, ...props }) => (
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2" {...props} />
        ),
        strong: ({ node, ...props }) => (
          <strong className="font-extrabold text-white" {...props} />
        ),
        p: ({ node, ...props }) => (
          <p className="leading-relaxed text-gray-200 mb-2" {...props} />
        ),
        li: ({ node, ordered, ...props }) => (
          <li className="ml-4 list-disc" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul className="space-y-1" {...props} />
        ),
        code: ({ inline, ...props }) => (
          inline ? (
            <code className="px-1 py-0.5 bg-white/10 rounded text-white" {...props} />
          ) : (
            <code className="block p-3 bg-white/10 rounded text-white whitespace-pre-wrap" {...props} />
          )
        )
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <div className="min-h-screen relative overflow-hidden flex">
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
      
      <div className="relative z-10 w-full flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-white/20 backdrop-blur-xl bg-white/10 flex flex-col`}>
        <div className="p-4 border-b border-white/20">
          <button
            onClick={createNewChat}
            className="w-full flex items-center gap-2 px-4 py-2.5 bg-white text-gray-900 hover:bg-white/90 rounded-full transition-all transform hover:scale-105 shadow-lg text-sm font-medium"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">No chats yet. Create one to get started!</div>
          ) : (
            <div className="p-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => loadChat(chat.id)}
                  className={`group relative flex items-center gap-2 p-3 rounded-lg mb-1 cursor-pointer transition-colors ${
                    currentChatId === chat.id
                      ? 'backdrop-blur-sm bg-white/15'
                      : 'hover:backdrop-blur-sm hover:bg-white/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-gray-400 text-lg flex-shrink-0">chat_bubble</span>
                  <div className="flex-1 min-w-0">
                    {editingTitle === chat.id ? (
                      <input
                        type="text"
                        value={editTitleValue}
                        onChange={(e) => {
                          e.stopPropagation();
                          setEditTitleValue(e.target.value);
                        }}
                        onBlur={(e) => handleSaveTitle(chat.id, e)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveTitle(chat.id, e);
                          } else if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full backdrop-blur-sm bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-white/40"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-200 truncate flex-1">{chat.title}</span>
                        <button
                          onClick={(e) => handleStartEditTitle(chat, e)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity flex-shrink-0"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-opacity flex-shrink-0"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-0.5">{formatDate(chat.updatedAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined">menu</span>
                </button>
                {currentChatId && chats.find(c => c.id === currentChatId) && (
                  <h1 className="text-xl font-bold text-white truncate max-w-md">
                    {chats.find(c => c.id === currentChatId)?.title}
                  </h1>
                )}
                {!currentChatId && (
                  <h1 className="text-xl font-bold text-white">AI Chat</h1>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/upload')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && !isLoading && (
              <div className="text-center mt-20">
                {user?.firstName ? (
                  <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
                    {getGreeting()}, {user.firstName}
                  </h1>
                ) : (
                  <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
                    {getGreeting()}
                  </h1>
                )}
                <h2 className="text-2xl font-bold text-white mb-2">How can I help you today?</h2>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className="space-y-3">
                {message.role === 'assistant' && message.thinking && (
                  <div className="flex gap-4 items-start justify-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="material-symbols-outlined text-sm text-white">psychology</span>
                    </div>
                    <div className="max-w-[85%] rounded-xl px-4 py-3 bg-purple-900/30 border border-purple-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Thought Process</span>
                      </div>
                      <div className="text-sm text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
                        {message.thinking}
                      </div>
                    </div>
                  </div>
                )}
                
                <div
                  className={`flex gap-4 items-start ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="material-symbols-outlined text-sm text-white">smart_toy</span>
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'backdrop-blur-xl bg-white/10 text-white border border-white/20'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-invert max-w-none">
                        <Markdown content={message.content} />
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="material-symbols-outlined text-sm text-white">person</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Thinking step - streaming */}
            {isThinking && currentThinking && (
              <div className="flex gap-4 items-start justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="material-symbols-outlined text-sm text-white">psychology</span>
                </div>
                <div className="max-w-[85%] rounded-xl px-4 py-3 bg-purple-900/30 border border-purple-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Thought Process</span>
                  </div>
                  <div className="text-sm text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
                    {currentThinking}
                    <span className="inline-block w-2 h-4 bg-purple-400 ml-1 animate-pulse">|</span>
                  </div>
                </div>
              </div>
            )}

            {/* Streaming message */}
            {isStreaming && streamingMessage && (
              <div className="flex gap-4 items-start justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="material-symbols-outlined text-sm text-white">smart_toy</span>
                </div>
                <div className="max-w-[85%] rounded-2xl px-4 py-3 shadow-sm backdrop-blur-xl bg-white/10 text-white border border-white/20">
                  <div className="prose prose-invert max-w-none">
                    <Markdown content={streamingMessage} />
                    <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-pulse">|</span>
                  </div>
                </div>
              </div>
            )}

            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 bg-black/80 backdrop-blur-md">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSendMessage} className="relative">
                <div className="flex items-end gap-2 backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 focus-within:border-white/40 focus-within:shadow-lg focus-within:shadow-white/10 transition-all">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => {
                      setInputMessage(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Message AI..."
                    rows={1}
                    className="flex-1 resize-none bg-transparent text-white placeholder-gray-400 px-4 py-3 focus:outline-none max-h-[200px] overflow-y-auto leading-relaxed"
                    style={{ minHeight: '52px', maxHeight: '200px' }}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading || isStreaming}
                    className="m-2 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isLoading || isStreaming ? (
                      <span className="material-symbols-outlined animate-spin">sync</span>
                    ) : (
                      <span className="material-symbols-outlined">send</span>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 px-2 text-center">
                  Press Enter to send, Shift+Enter for new line. AI can make mistakes. Check important info.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
