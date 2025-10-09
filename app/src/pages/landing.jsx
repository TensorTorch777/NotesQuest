import React from 'react';
import { Link } from 'react-router-dom';
import notesQuestImg from '../assets/Notequest.png';

const Landing = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-light font-body text-text-light-secondary dark:text-text-light-secondary">
      {/* Header */}
      <header className="border-b border-border-light dark:border-border-light bg-background-light/80 dark:bg-background-light/80 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-6xl flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img src={notesQuestImg} alt="NotesQuest" className="h-8 w-8 object-contain" />
            <h2 className="text-xl font-bold text-gray-900 font-display">NotesQuest</h2>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" href="#">Product</a>
            <a className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" href="#">Pricing</a>
            <a className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" href="#">Resources</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden md:inline-block">
              <button className="bg-primary text-white font-bold text-sm py-2 px-4 rounded-lg hover:bg-accent-2 transition-colors shadow-lg">
                Get Started
              </button>
            </Link>
            <button className="md:hidden p-2 rounded-lg bg-primary/20 text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16M4 12h16m-7 6h7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-grow">
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight tracking-tighter font-display">
                Summarize and Quiz Yourself. Instantly.
              </h1>
              <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
                Upload your textbook chapter and get a concise summary and a verified quiz to test your knowledge. Focus on what matters most.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/login">
                  <button className="bg-primary text-white font-bold py-3 px-6 rounded-xl text-lg hover:bg-primary/90 transition-colors shadow-lg">Get Started for Free</button>
                </Link>
                <a href="#learn-more" className="bg-white text-primary font-bold py-3 px-6 rounded-xl text-lg border border-border-light hover:bg-gray-50 transition-colors">Learn More</a>
              </div>
            </div>
            <div className="relative w-full h-80 lg:h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-primary bg-white flex items-center justify-center">
              <img src={notesQuestImg} alt="NotesQuest preview" className="max-h-full max-w-full object-contain" />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="learn-more" className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-display">Sweet Success Stories!</h2>
            <p className="mt-4 text-lg text-gray-600">Hear what our users are buzzing about!</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <div className="speech-bubble p-6 rounded-2xl shadow-xl center">
                <p className="text-lg italic text-gray-700 mb-4">"StudySmart has revolutionized my study habits. The summaries are incredibly accurate, and the quizzes help me retain information like never before!"</p>
              </div>
              <div className="mt-8 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-3xl mb-3 shadow-lg"><span className="text-4xl">🍬</span></div>
                <div>
                  <p className="font-bold text-gray-900 text-lg font-display">Alex Johnson</p>
                  <p className="text-sm text-gray-600">University Whiz</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="speech-bubble p-6 rounded-2xl shadow-xl center">
                <p className="text-lg italic text-gray-700 mb-4">"As a busy professional, I don't have much time to read long chapters. StudySmart's concise summaries save me hours of study time each week!"</p>
              </div>
              <div className="mt-8 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-3xl mb-3 shadow-lg"><span className="text-4xl">🍭</span></div>
                <div>
                  <p className="font-bold text-gray-900 text-lg font-display">Maria Garcia</p>
                  <p className="text-sm text-gray-600">Pro Power-User</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="speech-bubble p-6 rounded-2xl shadow-xl center">
                <p className="text-lg italic text-gray-700 mb-4">"The quiz generation feature is a game-changer. It adapts to the content and really tests my understanding, preparing me perfectly for exams!"</p>
              </div>
              <div className="mt-8 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-3xl mb-3 shadow-lg"><span className="text-4xl">💖</span></div>
                <div>
                  <p className="font-bold text-gray-900 text-lg font-display">Sam Lee</p>
                  <p className="text-sm text-gray-600">Exam Ace</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-accent-1/60 dark:border-accent-2 bg-white dark:bg-background-dark">
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">© 2024 NotesQuest. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-6">
              <a className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" href="#">Product</a>
              <a className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" href="#">Pricing</a>
              <a className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" href="#">Resources</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;