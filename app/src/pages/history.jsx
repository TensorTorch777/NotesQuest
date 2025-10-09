// src/pages/Summary.jsx
import React from "react";

export default function History() {
  return (
    <div className="flex flex-col min-h-screen relative bg-background-light font-body text-on-surface noise-texture">
      {/* Background design removed as requested */}

      {/* Header */}
      <header className="bg-background-light/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <a className="flex items-center gap-2 text-gray-900" href="#">
                <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93c0-.62.08-1.21.21-1.79L8 12v1c0 1.1.9 2 2 2v3.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1s-1 .45-1 1v3h-1c-.55 0-1 .45-1 1s.45 1 1 1h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c.34 0 .65-.17.83-.44L17.9 17.39zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8z" />
                </svg>
                <span className="text-xl font-sans font-bold text-gray-900">NotesQuest</span>
              </a>

              <nav className="hidden md:flex items-center gap-6">
                <a className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" href="#">Home</a>
                <a className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" href="#">Upload</a>
                <a className="text-sm font-bold text-primary" href="#">History</a>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input
                  className="bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none w-48 lg:w-64 transition-all"
                  placeholder="Search history..."
                  type="search"
                />
              </div>

              <button className="rounded-full">
                <img alt="User avatar" className="h-10 w-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrSdawYOlx_WzNPO6vvljh8B-xJcQPKcaQnAGJ_V8iB8tHsWSTSplVjRfr43axWpA9H9bg65af4Q8hfHle_k4LoV38V5Z1MbuKjfGpfvngpimkb4qcrYnQX6CpKC-xFQT0XuBzKr0IXwqhF_QtRCiiKMcne8H0GFqG6RnesIErDLokDOvHHfDYZMRGet5NYvCfbuJ0uuoBx9EeaLxjeytoz0R5grgymAYQC_6tBRHrbNO4v_-zS0oEH6uHj9hhAJ0zcKHuPWs3CBWt" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer removed */}

      {/* Main content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-4xl font-sans font-bold text-gray-900">Past Results</h1>
              <p className="mt-2 text-lg text-gray-600">Your generated summaries and quizzes, all in one place.</p>
            </div>

            <div className="space-y-4">
              {/* Item 1 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-soft-lg transition-shadow duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-sans font-medium text-on-surface">Chapter 1: Introduction to Biology</h2>
                      <p className="text-sm text-on-surface/60 mt-1">2024-01-15</p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <a className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-opacity-90 transition-colors" href="#">
                        <span className="material-symbols-outlined text-base">description</span>
                        Summary
                      </a>
                      <a className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors" href="#">
                        <span className="material-symbols-outlined text-base">quiz</span>
                        Quiz
                      </a>
                    </div>
                  </div>
                </div>
                <div className="h-1 bg-accent-1" style={{ boxShadow: "inset 0 1px 1px rgba(0,0,0,0.1)" }} />
              </div>

              {/* Item 2 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-soft-lg transition-shadow duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-sans font-medium text-on-surface">Chapter 2: Cell Structure and Function</h2>
                      <p className="text-sm text-on-surface/60 mt-1">2024-02-20</p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <a className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-opacity-90 transition-colors" href="#">
                        <span className="material-symbols-outlined text-base">description</span>
                        Summary
                      </a>
                      <a className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors" href="#">
                        <span className="material-symbols-outlined text-base">quiz</span>
                        Quiz
                      </a>
                    </div>
                  </div>
                </div>
                <div className="h-1 bg-accent-2" style={{ boxShadow: "inset 0 1px 1px rgba(0,0,0,0.1)" }} />
              </div>

              {/* Item 3 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-soft-lg transition-shadow duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-sans font-medium text-on-surface">Chapter 3: Genetics and Heredity</h2>
                      <p className="text-sm text-on-surface/60 mt-1">2024-03-25</p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <a className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-opacity-90 transition-colors" href="#">
                        <span className="material-symbols-outlined text-base">description</span>
                        Summary
                      </a>
                      <a className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors" href="#">
                        <span className="material-symbols-outlined text-base">quiz</span>
                        Quiz
                      </a>
                    </div>
                  </div>
                </div>
                <div className="h-1 bg-accent-3" style={{ boxShadow: "inset 0 1px 1px rgba(0,0,0,0.1)" }} />
              </div>

              {/* Item 4 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-soft-lg transition-shadow duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-sans font-medium text-on-surface">Chapter 4: Evolution and Natural Selection</h2>
                      <p className="text-sm text-on-surface/60 mt-1">2024-04-30</p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <a className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-opacity-90 transition-colors" href="#">
                        <span className="material-symbols-outlined text-base">description</span>
                        Summary
                      </a>
                      <a className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors" href="#">
                        <span className="material-symbols-outlined text-base">quiz</span>
                        Quiz
                      </a>
                    </div>
                  </div>
                </div>
                <div className="h-1 bg-primary" style={{ boxShadow: "inset 0 1px 1px rgba(0,0,0,0.1)" }} />
              </div>

              {/* Item 5 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-soft-lg transition-shadow duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-sans font-medium text-on-surface">Chapter 5: Ecology and Ecosystems</h2>
                      <p className="text-sm text-on-surface/60 mt-1">2024-05-05</p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <a className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-opacity-90 transition-colors" href="#">
                        <span className="material-symbols-outlined text-base">description</span>
                        Summary
                      </a>
                      <a className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors" href="#">
                        <span className="material-symbols-outlined text-base">quiz</span>
                        Quiz
                      </a>
                    </div>
                  </div>
                </div>
                <div className="h-1 bg-accent-1" style={{ boxShadow: "inset 0 1px 1px rgba(0,0,0,0.1)" }} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
