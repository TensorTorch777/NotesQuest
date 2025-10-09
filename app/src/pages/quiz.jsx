import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Quiz() {
  const [showAnswer1, setShowAnswer1] = useState(false);
  const [showAnswer3, setShowAnswer3] = useState(false);

  return (
    <div className="bg-background-light dark:bg-background-light font-body text-text-light dark:text-text-light noise-texture">
      <div className="relative flex min-h-screen w-full flex-col">
        <div className="path-bg -z-10" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: -10 }}>
          <svg width="1200" height="800" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FCE4EC" />
                <stop offset="100%" stopColor="#880E4F" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <path d="M-200 400 Q 150 100, 400 400 T 1000 400" stroke="url(#pinkGradient)" strokeWidth="80" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0px 0px 15px rgba(236, 64, 122, 0.1))' }} />
            <path d="M1400 200 Q 1050 500, 800 200 T 200 200" stroke="url(#pinkGradient)" strokeWidth="60" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0px 0px 10px rgba(236, 64, 122, 0.05))' }} />
            <path d="M-100 700 Q 300 500, 600 700 T 1300 700" stroke="url(#pinkGradient)" strokeWidth="45" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0px 0px 20px rgba(236, 64, 122, 0.15))' }} />
          </svg>
        </div>

        <header className="sticky top-0 bg-background-light/70 backdrop-blur-sm flex items-center justify-between whitespace-nowrap border-b border-black/10 px-4 sm:px-6 lg:px-8 py-3 z-10">
          <div className="flex items-center gap-4 text-text-light">
            <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.08V7.92c0-.41.47-.65.8-.4l4.67 3.08c.33.22.33.74 0 .96l-4.67 3.08c-.33.25-.8.01-.8-.4z"></path></svg>
            <h2 className="font-sans text-2xl font-bold">NotesQuest</h2>
          </div>
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-8 font-sans">
              <a href="#" className="text-sm font-medium text-text-light/70 hover:text-primary transition-colors">Dashboard</a>
              <a href="#" className="text-sm font-medium text-text-light/70 hover:text-primary transition-colors">Library</a>
              <a href="#" className="text-sm font-bold text-primary">Quizzes</a>
              <a href="#" className="text-sm font-medium text-text-light/70 hover:text-primary transition-colors">Settings</a>
              <Link to="/history" className="text-sm font-medium text-text-light/70 hover:text-primary transition-colors">History</Link>
            </nav>
            <img className="size-10 rounded-full" alt="User avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2u-RHq0IRab4HXt2h5dU8C8qxq0MhPWWvfx1eTftLq8LNVs5nkjUvVulAUGWUxSGXiC2uxtIIfjsy7jtyjpRtq8hYI9J3DNA2QO07yuriCV96m6t-ywfHcPKNdL6T0z4cxmIrvTI97nm3bhKrA7l3lkkqogo4DXxLgN7v2iQ64OMBnzJhVkK_MPVcul1osyQU8ZwQBJIt6lW6NaqQkAvPzvpM046VcgZVyqgasF7MCND2nYBmPKQTM0JRShparg8_dkLWcyT5cXun" />
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          <div className="max-w-3xl mx-auto space-y-10">
            <div className="mb-4">
              <h1 className="font-sans text-3xl font-bold tracking-tight text-text-light sm:text-4xl">Quiz: Chapter 3 - The Renaissance</h1>
              <p className="mt-3 text-base text-text-light/80">Test your knowledge on the key concepts from the chapter.</p>
            </div>

            <div className="space-y-8">
              {/* Question 1 */}
              <div className="bg-surface-light/80 backdrop-blur-sm rounded-2xl shadow-soft noise-texture">
                <div className="p-6">
                  <div className="flex items-start gap-6">
                    <span className="flex-shrink-0 text-primary font-sans font-bold text-xl">1.</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-sans font-bold text-text-light">What was the primary focus of Renaissance art?</h3>
                      <p className="text-sm text-text-light/70 mt-1">Multiple Choice Question</p>
                      <div className="mt-4 space-y-3">
                        {['Religious iconography','Realistic human figures and perspective','Abstract expressionism','Geometric patterns'].map((opt, idx) => (
                          <label key={idx} className="flex items-center p-3 rounded-xl bg-background-light hover:bg-primary/10 transition-colors cursor-pointer ring-1 ring-inset ring-transparent hover:ring-primary">
                            <input type="radio" name="q1" className="h-5 w-5 text-primary focus:ring-primary border-black/20 bg-transparent" />
                            <span className="ml-4 text-base text-text-light">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 border-t stitched-border border-black/10" style={{ ['--tw-border-opacity']: 0.5 }}>
                  <div className="flex items-center justify-between">
                    <a href="#" className="flex items-center gap-2 text-sm font-medium text-text-light/70 hover:text-primary transition-colors group"><span className="material-symbols-outlined text-xl">link</span><span className="border-b border-dashed border-text-light/40 group-hover:border-primary/80 transition-colors">View Source</span></a>
                    <button onClick={() => setShowAnswer1(v => !v)} className="flex items-center gap-2 text-sm font-medium text-analogous-1 hover:text-analogous-1/80 transition-colors"><span className="material-symbols-outlined text-xl">{showAnswer1 ? 'visibility_off' : 'visibility'}</span><span>{showAnswer1 ? 'Hide Answer' : 'Show Answer'}</span></button>
                  </div>
                  {showAnswer1 && (
                    <div className="mt-3 pt-3 border-t stitched-border border-black/10" style={{ ['--tw-border-opacity']: 0.5 }}>
                      <p className="text-base font-sans font-medium text-text-light">Correct Answer: <span className="font-body font-normal">b) Realistic human figures and perspective</span></p>
                      <p className="mt-2 text-base text-text-light/80">Explanation: Renaissance art moved away from the more stylized and symbolic forms of the Middle Ages towards a greater focus on naturalism, anatomical accuracy, and the mathematical principles of perspective.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Question 2 */}
              <div className="bg-surface-light/80 backdrop-blur-sm rounded-2xl shadow-soft noise-texture">
                <div className="p-6">
                  <div className="flex items-start gap-6">
                    <span className="flex-shrink-0 text-primary font-sans font-bold text-xl">2.</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-sans font-bold text-text-light">Name one major Renaissance artist and their most famous work.</h3>
                      <p className="text-sm text-text-light/70 mt-1">Short Answer Question</p>
                      <div className="mt-6">
                        <textarea rows={3} placeholder="Your answer here..." className="w-full rounded-xl border-black/20 bg-background-light focus:ring-primary focus:border-primary text-text-light p-4 placeholder:text-text-light/50"></textarea>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 border-t stitched-border border-black/10" style={{ ['--tw-border-opacity']: 0.5 }}>
                  <a href="#" className="flex items-center gap-2 text-sm font-medium text-text-light/70 hover:text-primary transition-colors group"><span className="material-symbols-outlined text-xl">link</span><span className="border-b border-dashed border-text-light/40 group-hover:border-primary/80 transition-colors">View Source</span></a>
                </div>
              </div>

              {/* Question 3 */}
              <div className="bg-surface-light/80 backdrop-blur-sm rounded-2xl shadow-soft noise-texture">
                <div className="p-6">
                  <div className="flex items-start gap-6">
                    <span className="flex-shrink-0 text-primary font-sans font-bold text-xl">3.</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-sans font-bold text-text-light">Which city is considered the birthplace of the Renaissance?</h3>
                      <p className="text-sm text-text-light/70 mt-1">Multiple Choice Question</p>
                      <div className="mt-4 space-y-3">
                        {['Rome','Venice','Florence','Milan'].map((opt, idx) => (
                          <label key={idx} className="flex items-center p-3 rounded-xl bg-background-light hover:bg-primary/10 transition-colors cursor-pointer ring-1 ring-inset ring-transparent hover:ring-primary">
                            <input type="radio" name="q3" className="h-5 w-5 text-primary focus:ring-primary border-black/20 bg-transparent" />
                            <span className="ml-4 text-base text-text-light">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 border-t stitched-border border-black/10" style={{ ['--tw-border-opacity']: 0.5 }}>
                  <div className="flex items-center justify-between">
                    <a href="#" className="flex items-center gap-2 text-sm font-medium text-text-light/70 hover:text-primary transition-colors group"><span className="material-symbols-outlined text-xl">link</span><span className="border-b border-dashed border-text-light/40 group-hover:border-primary/80 transition-colors">View Source</span></a>
                    <button onClick={() => setShowAnswer3(v => !v)} className="flex items-center gap-2 text-sm font-medium text-analogous-1 hover:text-analogous-1/80 transition-colors"><span className="material-symbols-outlined text-xl">{showAnswer3 ? 'visibility_off' : 'visibility'}</span><span>{showAnswer3 ? 'Hide Answer' : 'Show Answer'}</span></button>
                  </div>
                  {showAnswer3 && (
                    <div className="mt-3 pt-3 border-t stitched-border border-black/10" style={{ ['--tw-border-opacity']: 0.5 }}>
                      <p className="text-base font-sans font-medium text-text-light">Correct Answer: <span className="font-body font-normal">c) Florence</span></p>
                      <p className="mt-2 text-base text-text-light/80">Explanation: Florence, with its wealthy patrons like the Medici family and a concentration of brilliant artists and thinkers, is widely regarded as the cradle of the Renaissance.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <Link to="/score">
                <button className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-sans text-base font-bold text-white shadow-soft-lg transition-all hover:bg-primary/90 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-light noise-texture">
                  <span className="material-symbols-outlined">send</span>
                  <span>Submit Quiz</span>
                </button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}