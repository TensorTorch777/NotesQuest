import React from 'react';
import { Link } from 'react-router-dom';

export default function Score() {
  return (
    <div className="bg-background-light dark:bg-background-light font-body text-on-background-light">
      <div className="relative min-h-screen">
        <div className="background-paths">
          <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="pink-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EE2B8C" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#EE2B8C" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M-100 100 Q 200 200 400 100 T 800 100" fill="none" stroke="url(#pink-grad)" strokeWidth="60" strokeLinecap="round" />
            <path d="M-50 300 Q 300 400 500 300 T 1000 300" fill="none" stroke="url(#pink-grad)" strokeWidth="50" strokeLinecap="round" />
            <path d="M100 500 Q 400 600 600 500 T 1200 500" fill="none" stroke="url(#pink-grad)" strokeWidth="40" strokeLinecap="round" />
            <path d="M-150 700 Q 250 800 450 700 T 950 700" fill="none" stroke="url(#pink-grad)" strokeWidth="55" strokeLinecap="round" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <header className="flex items-center justify-between px-6 py-4 md:px-10">
            <div className="flex items-center gap-3">
              <div className="text-primary size-7">
                <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"></path></svg>
              </div>
              <h1 className="font-display text-xl font-bold text-on-background-light">NotesQuest</h1>
            </div>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6">
                <Link to="/" className="text-sm font-medium text-on-background-light hover:text-primary transition-colors">Home</Link>
                <Link to="/summary" className="text-sm font-medium text-on-background-light hover:text-primary transition-colors">Summaries</Link>
                <span className="text-sm font-bold text-primary">Quizzes</span>
              </nav>
              <button className="flex items-center justify-center size-10 rounded-full bg-surface-light text-on-surface-light">
                <span className="material-symbols-outlined">help</span>
              </button>
              <div className="size-10 rounded-full bg-center bg-no-repeat bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCBPKhusRb-CzJar5s238nhb3zUlBEI-hHDv6E75joFWFxPxiCTqXuigSp8E4W-yS9YEL2fJOZ4qpQXLBe3jQ4JGvEW6LiJuvdlV8hUiZuFDST8A18IgJikUgbrODAzXxdLmMvbDHMMzzVb0J1QSfrQKQ5IOU22bfoXp4ClV1UjwDzGXuqKExUxUnvEQ7TWSJeaNi7pGiRGRwToe0nPio1GbrdKf0_ZnOT2aohSIGctxT4beCbGCmDpw2Z4lp-46FeUkd3aFJt0Bc91")' }} />
            </div>
          </header>

          <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-2xl bg-surface-light/50 backdrop-blur-sm rounded-xl shadow-soft stitched-border p-6 md:p-8 text-center space-y-8">
              <div className="space-y-2">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-on-surface-light">Quiz Complete!</h2>
                <p className="text-on-surface-variant-light">Here's how you did on the "Introduction to Biology" quiz.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="relative flex items-center justify-center">
                  <svg className="size-40" viewBox="0 0 100 100">
                    <circle className="text-primary/20" cx="50" cy="50" fill="transparent" r="45" stroke="currentColor" strokeWidth="10" />
                    <circle className="text-primary transform -rotate-90 origin-center" cx="50" cy="50" fill="transparent" r="45" stroke="currentColor" strokeDasharray="283" strokeDashoffset="56.6" strokeLinecap="round" strokeWidth="10" />
                  </svg>
                  <span className="absolute font-display text-4xl font-bold text-on-surface-light">80%</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center size-8 rounded-full bg-success-light/20 text-success-light">
                      <span className="material-symbols-outlined text-base">check</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface-light">8</p>
                      <p className="text-sm text-on-surface-variant-light">Correct</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center size-8 rounded-full bg-error-light/20 text-error-light">
                      <span className="material-symbols-outlined text-base">close</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface-light">2</p>
                      <p className="text-sm text-on-surface-variant-light">Incorrect</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-left">
                  <h3 className="font-display text-xl font-semibold mb-3 text-on-surface-light">Review Your Answers</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 p-3 rounded bg-background-light">
                      <div className="flex-shrink-0 size-8 rounded-full flex items-center justify-center bg-success-light/20 text-success-light">
                        <span className="material-symbols-outlined text-lg">check</span>
                      </div>
                      <p className="flex-1 text-sm font-medium text-on-background-light">Question 1: What is the powerhouse of the cell?</p>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded bg-background-light">
                      <div className="flex-shrink-0 size-8 rounded-full flex items-center justify-center bg-error-light/20 text-error-light">
                        <span className="material-symbols-outlined text-lg">close</span>
                      </div>
                      <p className="flex-1 text-sm font-medium text-on-background-light">Question 2: What is the primary function of DNA?</p>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded bg-background-light">
                      <div className="flex-shrink-0 size-8 rounded-full flex items-center justify-center bg-success-light/20 text-success-light">
                        <span className="material-symbols-outlined text-lg">check</span>
                      </div>
                      <p className="flex-1 text-sm font-medium text-on-background-light">Question 3: Which of these is not a mammal?</p>
                    </div>
                    <p className="text-xs text-center pt-2 text-on-surface-variant-light">... and 7 more questions</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Link to="/quiz">
                  <button className="flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-primary text-white font-bold tracking-wide shadow-soft hover:bg-primary/90 transition-all">
                    <span className="material-symbols-outlined">refresh</span>
                    <span>Take Again</span>
                  </button>
                </Link>
                <Link to="/">
                  <button className="flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-surface-light text-on-surface-light font-bold tracking-wide shadow-soft hover:bg-surface-light/80 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                    <span>Back to Dashboard</span>
                  </button>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}