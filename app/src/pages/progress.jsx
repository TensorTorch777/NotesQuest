// src/pages/progress.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Progress() {
  const location = useLocation();
  const navigate = useNavigate();
  const target = (location.state && location.state.target) === 'quiz' ? 'quiz' : 'summary';

  const lines = useMemo(() => [
    "[10:30:05] INFO: Initializing content ingestion pipeline...",
    "[10:30:08] INFO: PDF parsed successfully, 25 pages detected.",
    "[10:30:12] INFO: Text extracted from PDF. Word count: 15,230.",
    "[10:30:18] INFO: Beginning Natural Language Processing (NLP) analysis...",
    "[10:30:25] INFO: Identifying key concepts and entities...",
    "[10:30:30] INFO: NLP analysis complete. Core data model generated.",
    "[10:30:32] SUCCESS: Prerequisite steps for Summary generation met.",
  ], []);

  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= lines.length) {
      const timeout = setTimeout(() => {
        navigate(target === 'quiz' ? '/quiz' : '/summary');
      }, 900);
      return () => clearTimeout(timeout);
    }
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), 1750);
    return () => clearTimeout(timer);
  }, [visibleCount, lines.length, navigate, target]);

  return (
    <div className="flex flex-col min-h-screen bg-background-light font-body text-gray-700 noise-texture">
      <header className="shadow-soft z-10 bg-background-light/80 backdrop-blur-sm border-b border-gray-100 sticky top-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="text-primary size-8">
                <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" /></svg>
              </div>
              <h1 className="text-xl font-sans font-bold text-gray-900">NotesQuest</h1>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a className="text-sm font-sans font-medium text-gray-600 hover:text-primary transition-colors" href="#">Dashboard</a>
              <a className="text-sm font-sans font-medium text-gray-600 hover:text-primary transition-colors" href="#">Documents</a>
              <a className="text-sm font-sans font-medium text-gray-600 hover:text-primary transition-colors" href="#">Quizzes</a>
            </nav>
            <div className="flex items-center gap-2">
              <button className="flex items-center justify-center size-10 rounded-full hover:bg-black/5 text-gray-500 transition-colors"><span className="material-symbols-outlined text-2xl">help_outline</span></button>
              <div className="size-10 rounded-full bg-cover bg-center ring-2 ring-offset-2 ring-offset-background-light ring-primary/50" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAHhcb-Ee3LkHOqMI41Odbkk2PTDcCNblmWNyWT_xSryEbID2YN6aXNAexQ31maKPoW-0EhjcEB5JZf8Rbm5tH-NIsKt3a1wa8tTfYhNingK94890VxOineF5ht1ijcwrdeLyk3MUGX3Jy9xaq2qOmBivKLgj8NvwFatcaMKqtdg191jl1pNEQYkGlmMh0wZVQG-lRz-UrHRKc5DLjISkIPk8EEx_bq6a7ZpbbSvRsHSQW9dbNegghunJG5THcZQuGo424KdJuNZ7vG")' }} />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center py-16 sm:py-24 relative">
        <div className="path-lines absolute inset-0 -z-10">
          <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="pink-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#F48FB1', stopOpacity: 0.6 }} />
                <stop offset="100%" style={{ stopColor: '#EC407A', stopOpacity: 0.8 }} />
              </linearGradient>
            </defs>
            <path className="path-line" d="M -50,300 C 150,100 250,500 450,300 S 650,100 850,300" style={{ strokeDasharray: 1000, strokeDashoffset: 1000, stroke: 'url(#pink-gradient)' }} />
            <path className="path-line" d="M -50,400 Q 200,650 400,400 T 850,350" style={{ strokeDasharray: 1200, strokeDashoffset: 1200, stroke: 'url(#pink-gradient)', animationDelay: '-5s', opacity: 0.7 }} />
            <path className="path-line" d="M 850,200 C 650,400 550,0 350,200 S 150,400 -50,200" style={{ strokeDasharray: 800, strokeDashoffset: 800, stroke: 'url(#pink-gradient)', animationDelay: '-10s', opacity: 0.5 }} />
          </svg>
        </div>

        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-soft p-8 sm:p-12 relative overflow-hidden">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full bg-primary/10 rounded-full animate-pulse blur-md" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="spline-orb w-[70%] h-[70%] bg-center bg-no-repeat bg-contain" style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuBFB5ujsoS7XDDNMONrKigmWwLJAbJF3VBsjmlF7mm4H3WTnu6tBA0jWtAkNNhJANFjZxNwIeZ05CbDziNfIdUPHJ6oBrUlDRJVVqCDaZeUAQmBSdNBcNLSAkkUKwGh0-l8hpDf8OWfugIYnlEWyWFnASJUN5mn-T6swYxv_aSZy45TvByUfgDWviV1eWb1etKrwYInqwXFZrRp0dNo9HSGjdJWaq_fAAi2nZRoJSphtVDfXwji6D25LN2jPjrRcl8LS0p1FlkyqGT6)' }} />
              </div>
            </div>
            <h2 className="text-3xl font-sans font-bold text-gray-900 sm:text-4xl">Live Activity Feed</h2>
            <p className="mt-3 text-gray-600 font-body">Here's what's happening behind the scenes.</p>
            <p className="mt-1 text-xs text-gray-500 font-mono">Job ID: 1234567890</p>
          </div>

          <div className="mt-10 space-y-6">
            <div className="p-4 bg-white rounded-xl live-activity-log font-mono text-xs text-gray-800 border border-gray-200 ring-1 ring-black/5 shadow-inner">
              <div className="mb-2">
                <span className="text-green-600">root@notesquest</span>
                <span className="text-gray-500">:~$</span>
                <span className="text-gray-800"> initiate_processing --job-id 1234567890</span>
              </div>
              {lines.slice(0, visibleCount).map((line, idx) => (
                <div key={idx} className="py-1">
                  <span className="text-yellow-600">{line.slice(0, 10)}</span>
                  <span className="text-sky-600"> {line.includes('SUCCESS') ? '' : 'INFO:'}</span>
                  <span className={line.includes('SUCCESS') ? 'text-green-600' : 'text-gray-800'}>
                    {line.includes('SUCCESS') ? ' SUCCESS:' + line.split('SUCCESS:')[1] : ' ' + line.slice(11)}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-4 text-center text-xs text-gray-600 font-body">Processing… this may take a moment.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
