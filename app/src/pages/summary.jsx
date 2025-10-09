import React from 'react';
import { Link } from 'react-router-dom';

export default function Summary() {
  return (
    <div className="bg-background-light dark:bg-background-light font-body text-text-light-secondary dark:text-text-light-secondary antialiased noise-texture">
      <div className="relative min-h-screen">
        <div className="path-background">
          <div className="path path-1"></div>
          <div className="path path-2"></div>
          <div className="path path-3"></div>
        </div>

        <div className="flex flex-col min-h-screen relative z-10">
          <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-light/80 backdrop-blur-sm border-b border-border-light dark:border-border-light">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                  <div className="text-primary size-8">
                    <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"></path></svg>
                  </div>
                  <h1 className="font-sans text-xl font-bold text-text-light-primary dark:text-text-light-primary">NotesQuest</h1>
                </div>
                <nav className="hidden md:flex items-center gap-6">
                  <a className="font-sans text-sm font-medium text-text-light-secondary dark:text-text-light-secondary hover:text-primary dark:hover:text-primary transition-colors" href="#">Dashboard</a>
                  <a className="font-sans text-sm font-medium text-primary dark:text-primary" href="#">Summaries</a>
                  <a className="font-sans text-sm font-medium text-text-light-secondary dark:text-text-light-secondary hover:text-primary dark:hover:text-primary transition-colors" href="#">Quizzes</a>
                  <a className="font-sans text-sm font-medium text-text-light-secondary dark:text-text-light-secondary hover:text-primary dark:hover:text-primary transition-colors" href="#">Flashcards</a>
                  <Link to="/history" className="font-sans text-sm font-medium text-text-light-secondary dark:text-text-light-secondary hover:text-primary dark:hover:text-primary transition-colors">History</Link>
                </nav>
                <div className="flex items-center gap-4">
                  <button className="p-2 rounded-full text-text-light-secondary dark:text-text-light-secondary hover:bg-gray-200 dark:hover:bg-gray-200 hover:text-text-light-primary dark:hover:text-text-light-primary transition-colors"><span className="material-symbols-outlined"> help </span></button>
                  <button className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCQMd0tyHkLOOsq01S76EcJ7gTUkNiak288G2WiJaa53U3AHbBz6Q5o1T5d_SSdn0_0M4593PsyxaIb3yeCi8YN0oiGuFHeBjzcFRDr_MejnFbPpfhL8m1JU3lMWigA7Y2SWJ0pkfU8c8-FfPe5fMjLCjDa3IEZ2Nx82FPKd8hC_ISM9IfgFk1cRNJ0Xx_-toLTl_JpCfoSeu_x3lvPR6sb_Scn491XwfsyOIm2ja69-wZOGwvo9r8UwvOvuXw1aKGRmDRD1gf-bIRO")' }}></button>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center text-sm text-text-light-secondary dark:text-text-light-secondary mb-8">
                  <a className="font-sans hover:text-primary" href="#">Summaries</a>
                  <span className="mx-2">/</span>
                  <span className="font-sans font-medium text-text-light-primary dark:text-text-dark-primary">Chapter 1 Summary</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-surface-light/80 dark:bg-surface-light/80 backdrop-blur-md p-8 rounded-soft-xl shadow-soft noise-texture">
                    <div className="relative">
                      <h2 className="font-sans text-3xl md:text-4xl font-bold text-text-light-primary dark:text-text-light-primary mb-4">Chapter 1: Introduction to Biology</h2>
                      <p className="text-base text-text-light-secondary dark:text-text-light-secondary leading-relaxed">
                        Biology is the study of life and living organisms, including their physical structure, chemical processes, molecular interactions, physiological mechanisms, development, and evolution. It encompasses a wide range of fields, from the microscopic study of cells and molecules to the macroscopic study of ecosystems and the biosphere. Key concepts in biology include cell theory, genetics, evolution, and homeostasis. Understanding these principles is fundamental to comprehending the diversity and complexity of life on Earth.
                      </p>
                      <div className="absolute -top-4 -right-4 size-12 bg-primary/10 text-primary rounded-full flex items-center justify-center opacity-50"><span className="material-symbols-outlined text-2xl">book</span></div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Link to="/progress" state={{ target: 'quiz' }} className="inline-flex">
                        <button className="flex items-center justify-center gap-2 rounded-soft-lg h-11 px-5 font-sans text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors shadow-sm backdrop-blur-md">
                          <span className="material-symbols-outlined text-base">quiz</span>
                          <span>Generate Quiz</span>
                        </button>
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-surface-light/80 dark:bg-surface-light/80 backdrop-blur-md p-6 rounded-soft-lg shadow-soft noise-texture">
                      <h3 className="font-sans text-xl font-bold text-text-light-primary dark:text-text-light-primary mb-4">Key Takeaways</h3>
                      <div className="space-y-5">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 size-10 rounded-full bg-analogous-1/10 flex items-center justify-center text-analogous-1"><span className="material-symbols-outlined text-xl"> science </span></div>
                          <div>
                            <p className="font-sans font-medium text-text-light-primary dark:text-text-light-primary">Cells</p>
                            <p className="text-sm text-text-light-secondary dark:text-text-light-secondary">The basic unit of life, responsible for all life processes.</p>
                          </div>
                        </div>
                        <div className="border-t border-border-light dark:border-border-light stitched-border"></div>
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 size-10 rounded-full bg-analogous-2/10 flex items-center justify-center text-analogous-2"><span className="material-symbols-outlined text-xl"> diversity_3 </span></div>
                          <div>
                            <p className="font-sans font-medium text-text-light-primary dark:text-text-light-primary">Evolution</p>
                            <p className="text-sm text-text-light-secondary dark:text-text-light-secondary">The process by which organisms adapt and change over time.</p>
                          </div>
                        </div>
                        <div className="border-t border-border-light dark:border-border-light stitched-border"></div>
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 size-10 rounded-full bg-complementary/10 flex items-center justify-center text-complementary"><span className="material-symbols-outlined text-xl"> balance </span></div>
                          <div>
                            <p className="font-sans font-medium text-text-light-primary dark:text-text-light-primary">Homeostasis</p>
                            <p className="text-sm text-text-light-secondary dark:text-text-light-secondary">The maintenance of a stable internal environment.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4">
                      <button className="flex items-center justify-center gap-2 rounded-soft-lg h-11 px-5 font-sans text-sm font-medium bg-gray-200/80 dark:bg-gray-200/80 text-text-light-primary dark:text-text-light-primary hover:bg-gray-300 transition-colors shadow-sm backdrop-blur-md"><span className="material-symbols-outlined text-base"> print </span><span>Print</span></button>
                      <button className="flex items-center justify-center gap-2 rounded-soft-lg h-11 px-5 font-sans text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors shadow-soft backdrop-blur-md"><span className="material-symbols-outlined text-base"> file_download </span><span>Export</span></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}