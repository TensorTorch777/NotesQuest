import React from 'react';
import { Link } from 'react-router-dom';

export default function Upload() {
  return (
    <div className="bg-background-light dark:bg-background-light font-body text-on-surface-light dark:text-on-surface-light noise-texture" style={{ ['--bg-color']: '#F8F9FA' }}>
      <div className="relative min-h-screen flex flex-col">
        <div className="background-lines"><div className="line-pattern" /></div>

        <header className="bg-surface-light/80 dark:bg-surface-light/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="text-primary size-8">
                  <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"></path></svg>
                </div>
                <h1 className="text-xl font-sans font-bold text-on-surface-light">NotesQuest</h1>
              </div>
              <nav className="hidden md:flex items-center gap-8">
                <Link to="/" className="text-sm font-sans font-medium text-on-surface-variant-light hover:text-primary transition-colors">Home</Link>
                <span className="text-sm font-sans font-medium text-on-surface-variant-light hover:text-primary transition-colors">Summarize</span>
                <Link to="/quiz" className="text-sm font-sans font-medium text-on-surface-variant-light hover:text-primary transition-colors">Quiz</Link>
                <Link to="/history" className="text-sm font-sans font-medium text-on-surface-variant-light hover:text-primary transition-colors">History</Link>
              </nav>
              <div className="flex items-center gap-4">
                <button className="p-2 rounded-full hover:bg-black/5 transition-colors"><span className="material-symbols-outlined text-on-surface-variant-light">help</span></button>
                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAby4AxbbTstXQJkmoUkd5NlmS8WZH6JnMO8yc7PkM4UCmvnojjaclPLed-Zd5Yz3Z2lA79cIUBEHC0V6If3TLwnwhcmlSkuSkrsZ-kO3zsAW547OIq9o9ryGepoUpQ0or1ULcnUUyVnhrW8DvlOfFUrFVLmOqUwLif2NoL0opDyZjj-KTQSk0QadwgLmVGtyunG5rgazxUirIHjfXAbQ7rBb9V7gu9H_2DWodbveGIcRGD_qkdCjbnt1MGUQKItHurGOUaNtSyztyJ")' }} />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-3xl space-y-12">
            <div className="text-center">
              <h2 className="text-4xl font-sans font-bold tracking-tight text-on-surface-light sm:text-5xl">Upload Your Chapter</h2>
              <p className="mt-4 text-lg text-on-surface-variant-light">Generate a summary and quiz from a PDF or text content.</p>
            </div>

            <div className="bg-white backdrop-blur-sm rounded-2xl shadow-soft p-8 space-y-8">
              <div className="relative flex justify-center rounded-2xl border border-dashed border-on-surface-variant-light/30 px-6 py-14 hover:border-primary/70 transition-colors bg-white">
                <div className="text-center">
                  <span className="material-symbols-outlined text-6xl text-on-surface-variant-light dark:text-on-surface-variant-dark">upload_file</span>
                  <div className="mt-4 flex text-sm leading-6 text-on-surface-variant-light dark:text-on-surface-variant-dark">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-sans font-medium text-primary hover:text-primary/80">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-on-surface-variant-light/70 dark:text-on-surface-variant-dark/70">PDF up to 10MB</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full stitched-divider" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-sm font-medium text-on-surface-variant-light">OR</span></div>
              </div>

              <div>
                <label className="sr-only" htmlFor="text-content">Paste text</label>
                <textarea id="text-content" name="text-content" rows={8} placeholder="Paste your chapter content here..." className="block w-full rounded-2xl border-0 bg-white/80 dark:bg-black/20 py-4 px-5 text-on-surface-light dark:text-on-surface-dark shadow-inner-stitch ring-1 ring-inset ring-on-surface-variant-light/30 dark:ring-on-surface-variant-dark/30 placeholder:text-on-surface-variant-light/70 dark:placeholder:text-on-surface-variant-dark/70 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6" />
              </div>
            </div>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to="/progress" state={{ target: 'summary' }} className="block">
                <button type="button" className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-soft text-base font-sans font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark focus:ring-primary transition-all duration-200 ease-in-out transform hover:scale-[1.02]">Generate Summary</button>
              </Link>
              <Link to="/progress" state={{ target: 'quiz' }} className="block">
                <button type="button" className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-soft text-base font-sans font-medium text-primary bg-white hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-light focus:ring-primary transition-all duration-200 ease-in-out">Generate Quiz</button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}