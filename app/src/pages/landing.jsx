import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import logoVideo from '../assets/Black_Background_Video_Generation.mp4';

const Landing = () => {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = React.useState(false);
  const [videoError, setVideoError] = React.useState(false);

  useEffect(() => {
    // Add dark class to body
    document.body.classList.add('dark');
    
    // Auto-play video when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log('Video autoplay failed:', e));
    }
    
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Observe elements for scroll animations
    const elementsToObserve = [
      heroRef.current,
      featuresRef.current,
      statsRef.current,
      testimonialsRef.current
    ].filter(Boolean);

    elementsToObserve.forEach(el => {
      if (el) {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
      }
    });

    return () => {
      elementsToObserve.forEach(el => {
        if (el) observer.unobserve(el);
      });
      document.body.classList.remove('dark');
    };
  }, []);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  const handleVideoError = () => {
    setVideoError(true);
    console.log('Video failed to load');
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden dark">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent animate-slide-in-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 animate-fade-in-left">
              <img src={logo} alt="NotesQuest" className="h-8 w-8 object-contain hover-scale" />
              <h2 className="text-xl font-bold text-white">NOTESQUEST</h2>
            </div>
            <div className="flex items-center gap-4 animate-fade-in-right">
              <Link to="/upload" className="hidden md:inline-block">
                <button className="btn-primary hover-glow animate-pulse-slow">
                  Get Started
                </button>
              </Link>
              <button className="md:hidden p-2 rounded-lg bg-gray-800 text-gray-300 hover-lift">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Video Background */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden video-container">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          {!videoError ? (
            <video
              ref={videoRef}
              className={`video-background ${!videoLoaded ? 'video-loading' : ''}`}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onLoadedData={handleVideoLoad}
              onError={handleVideoError}
            >
              <source src={logoVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="video-loading w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading animation...</p>
              </div>
            </div>
          )}
          {/* No overlay to preserve video quality */}
        </div>
        
        {/* Glowing Arc Background */}
        <div className="glowing-arc">
          <div className="arc-path"></div>
        </div>
        
        <div className="video-text-overlay px-4 sm:px-6 lg:px-8 flex flex-col justify-end items-center min-h-screen pb-20">
          {/* Tagline */}
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 animate-fade-in-up delay-200">
            LEARNING THAT SIMPLY WORKS
          </h1>
          
          {/* CTA Button */}
          <div className="animate-fade-in-up delay-300">
            <Link to="/upload">
              <button className="bg-white text-black font-bold text-lg px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover-lift hover-glow">
                Get Started for Free
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in-up">
              Powerful Learning Tools
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto animate-fade-in-up delay-200">
              Everything you need to transform your study sessions and ace your exams
            </p>
          </div>
          
          <div className="feature-grid">
            <div className="modern-card p-8 text-center hover-lift animate-scale-in delay-100">
              <div className="icon-container">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Summaries</h3>
              <p className="text-gray-300 mb-6">
                Get concise, accurate summaries of your textbook chapters in seconds. 
                Our AI extracts the key concepts and main ideas.
              </p>
              <div className="text-sm text-gray-400">
                <div className="flex items-center justify-center gap-2 mb-2 animate-fade-in-left delay-200">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  Instant processing
                </div>
                <div className="flex items-center justify-center gap-2 animate-fade-in-left delay-300">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  High accuracy
                </div>
              </div>
            </div>

            <div className="modern-card p-8 text-center hover-lift animate-scale-in delay-200">
              <div className="icon-container">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">AI-Powered Quizzes</h3>
              <p className="text-gray-300 mb-6">
                Test your knowledge with intelligent quizzes that adapt to your content. 
                Get instant feedback and track your progress.
              </p>
              <div className="text-sm text-gray-400">
                <div className="flex items-center justify-center gap-2 mb-2 animate-fade-in-left delay-300">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  Adaptive questions
                </div>
                <div className="flex items-center justify-center gap-2 animate-fade-in-left delay-400">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  Instant feedback
                </div>
              </div>
            </div>

            <div className="modern-card p-8 text-center hover-lift animate-scale-in delay-300">
              <div className="icon-container">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Progress Tracking</h3>
              <p className="text-gray-300 mb-6">
                Monitor your learning journey with detailed analytics. 
                See your improvement over time and identify areas for focus.
              </p>
              <div className="text-sm text-gray-400">
                <div className="flex items-center justify-center gap-2 mb-2 animate-fade-in-left delay-400">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  Detailed analytics
                </div>
                <div className="flex items-center justify-center gap-2 animate-fade-in-left delay-500">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  Performance insights
                </div>
              </div>
            </div>

            <div className="modern-card p-8 text-center hover-lift animate-scale-in delay-400">
              <div className="icon-container">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Interactive Flashcards</h3>
              <p className="text-gray-300 mb-6">
                Master key concepts with interactive flashcards that help you memorize effectively. 
                Flip, review, and reinforce your knowledge anytime.
              </p>
              <div className="text-sm text-gray-400">
                <div className="flex items-center justify-center gap-2 mb-2 animate-fade-in-left delay-500">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  Active recall
                </div>
                <div className="flex items-center justify-center gap-2 animate-fade-in-left delay-600">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  Spaced repetition
                </div>
              </div>
            </div>

            <div className="modern-card p-8 text-center hover-lift animate-scale-in delay-500">
              <div className="icon-container">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Qwen LLM</h3>
              <p className="text-gray-300 mb-6">
                Powered by state-of-the-art Qwen Large Language Model for superior accuracy and understanding. 
                Experience cutting-edge AI that truly understands context.
              </p>
              <div className="text-sm text-gray-400">
                <div className="flex items-center justify-center gap-2 mb-2 animate-fade-in-left delay-600">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  Advanced AI model
                </div>
                <div className="flex items-center justify-center gap-2 animate-fade-in-left delay-700">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  Context-aware responses
                </div>
              </div>
            </div>

            <div className="modern-card p-8 text-center hover-lift animate-scale-in delay-600">
              <div className="icon-container">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v6h6"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Multi-Format Support</h3>
              <p className="text-gray-300 mb-6">
                Upload and process documents in multiple formats including PDF, text files, and more. 
                Our smart system extracts and processes content seamlessly from any source.
              </p>
              <div className="text-sm text-gray-400">
                <div className="flex items-center justify-center gap-2 mb-2 animate-fade-in-left delay-700">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  PDF & Text support
                </div>
                <div className="flex items-center justify-center gap-2 animate-fade-in-left delay-800">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  Smart text extraction
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in-up delay-100">
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2 animate-pulse-slow neon-glow-blue">10K+</div>
              <div className="text-gray-300">Students</div>
            </div>
            <div className="animate-fade-in-up delay-200">
              <div className="text-4xl md:text-5xl font-bold text-green-400 mb-2 animate-pulse-slow neon-glow">95%</div>
              <div className="text-gray-300">Success Rate</div>
            </div>
            <div className="animate-fade-in-up delay-300">
              <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2 animate-pulse-slow neon-glow-purple">50K+</div>
              <div className="text-gray-300">Documents Processed</div>
            </div>
            <div className="animate-fade-in-up delay-400">
              <div className="text-4xl md:text-5xl font-bold text-pink-400 mb-2 animate-pulse-slow neon-glow-pink">24/7</div>
              <div className="text-gray-300">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section ref={testimonialsRef} className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in-up">
              Trusted by Students Worldwide
            </h2>
            <p className="text-xl text-gray-300 animate-fade-in-up delay-200">
              See what our users are saying about their success
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="modern-card p-8 hover-lift animate-fade-in-left delay-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 hover-scale">
                  AJ
                </div>
                <div>
                  <h4 className="font-bold text-white">Alex Johnson</h4>
                  <p className="text-gray-400 text-sm">Computer Science Student</p>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "NotesQuest has revolutionized my study habits. The summaries are incredibly accurate, 
                and the quizzes help me retain information like never before!"
              </p>
              <div className="flex text-yellow-400 mt-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current animate-fade-in-up" style={{animationDelay: `${i * 0.1}s`}} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
            </div>

            <div className="modern-card p-8 hover-lift animate-fade-in-up delay-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 hover-scale">
                  MG
                </div>
                <div>
                  <h4 className="font-bold text-white">Maria Garcia</h4>
                  <p className="text-gray-400 text-sm">Business Student</p>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "As a busy professional student, I don't have much time to read long chapters. 
                NotesQuest's concise summaries save me hours of study time each week!"
              </p>
              <div className="flex text-yellow-400 mt-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current animate-fade-in-up" style={{animationDelay: `${i * 0.1}s`}} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
            </div>

            <div className="modern-card p-8 hover-lift animate-fade-in-right delay-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 hover-scale">
                  SL
                </div>
                <div>
                  <h4 className="font-bold text-white">Sam Lee</h4>
                  <p className="text-gray-400 text-sm">Medical Student</p>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "The quiz generation feature is a game-changer. It adapts to the content and really 
                tests my understanding, preparing me perfectly for exams!"
              </p>
              <div className="flex text-yellow-400 mt-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current animate-fade-in-up" style={{animationDelay: `${i * 0.1}s`}} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 dark-hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in-up">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto animate-fade-in-up delay-200">
            Join thousands of students who are already studying smarter with NotesQuest
          </p>
          <Link to="/upload">
            <button className="bg-white text-black font-bold text-lg px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover-lift hover-glow animate-fade-in-up delay-300">
              Get Started for Free
            </button>
          </Link>
          <p className="text-gray-400 text-sm mt-4 animate-fade-in-up delay-400">
            Absolutely free — forever
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in-left">
            <div className="flex items-center gap-3 mb-4 justify-center">
              <img src={logo} alt="NotesQuest" className="h-8 w-8 object-contain hover-scale" />
              <h3 className="text-xl font-bold">NOTESQUEST</h3>
            </div>
            <p className="text-gray-400 text-center">
              Transform your study sessions with AI-powered summaries and quizzes.
            </p>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 animate-fade-in-up delay-400">
            <p>Created with love by Nimish</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;