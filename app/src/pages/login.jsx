import React from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden path-bg-radial bg-background-light dark:bg-background-light font-display text-text-light-secondary dark:text-text-light-secondary">
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="mx-auto container px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 text-gray-900">
            <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"></path></svg>
            <h1 className="text-2xl font-bold text-gray-900">NotesQuest</h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/upload" className="text-sm font-medium text-text-light-secondary hover:text-primary transition-colors">Home</Link>
            <a className="text-sm font-medium text-text-light-secondary hover:text-primary transition-colors" href="#">Features</a>
            <a className="text-sm font-medium text-text-light-secondary hover:text-primary transition-colors" href="#">Pricing</a>
            <a className="text-sm font-medium text-text-light-secondary hover:text-primary transition-colors" href="#">Support</a>
            <Link to="/history" className="text-sm font-medium text-text-light-secondary hover:text-primary transition-colors">History</Link>
          </nav>
          <div className="flex items-center gap-4">
            <button className="px-6 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-300">Login</button>
            <button className="hidden sm:block px-6 py-2 text-sm font-bold bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary rounded-lg hover:bg-primary/30 dark:hover:bg-primary/40 transition-all duration-300">Sign Up</button>
          </div>
        </div>
      </header>

      <main className="flex items-center justify-center min-h-screen py-24 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 bg-background-light/80 dark:bg-background-light/80 backdrop-blur-sm p-10 rounded-xl shadow-2xl shadow-primary/10">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-text-light-primary">Welcome back</h2>
            <p className="mt-2 text-center text-sm text-text-light-secondary">Login to your StudySmart account</p>
          </div>

          <form className="mt-8 space-y-6" method="POST">
            <div className="rounded-lg -space-y-px">
              <div>
                <label className="sr-only" htmlFor="email-address">Email or Username</label>
                <input id="email-address" type="email" autoComplete="email" required className="appearance-none relative block w-full px-4 py-3 bg-white border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary sm:text-sm" placeholder="Email or Username" />
              </div>
              <div>
                <label className="sr-only" htmlFor="password">Password</label>
                <input id="password" type="password" autoComplete="current-password" required className="appearance-none relative block w-full px-4 py-3 bg-white border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary sm:text-sm" placeholder="Password" />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <a className="font-medium text-primary hover:text-primary/90" href="#">Forgot your password?</a>
              </div>
            </div>

            <div>
              <Link to="/upload" className="block w-full">
                <button type="button" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300">Login</button>
              </Link>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-700"></div></div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background-light dark:bg-background-dark text-gray-500 dark:text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <div>
              <a href="#" className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-primary/20 dark:bg-primary/30 text-sm font-medium text-primary hover:bg-primary/30 dark:hover:bg-primary/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300">
                <span className="sr-only">Login with Google</span>
                <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path><path d="M1 1h22v22H1z" fill="none"></path></svg>
                <span className="ml-3">Login with Your Favorite Provider</span>
              </a>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">Don't have an account? <a className="font-medium text-primary hover:text-primary/90" href="#">Sign up</a></p>
        </div>
      </main>
    </div>
  );
}