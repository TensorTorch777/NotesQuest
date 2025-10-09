/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/index.html",
    "./app/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED',
        'accent-1': '#F59E0B',
        'accent-2': '#10B981',
        'accent-3': '#3B82F6',
        'background-light': '#F8FAFC',
        'background-dark': '#0B1020',
        surface: '#FFFFFF',
        'surface-dark': '#111827',
        'on-surface': '#111827',
        'on-surface-dark': '#E5E7EB',
      },
      fontFamily: {
        display: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
        body: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
      },
      boxShadow: {
        soft: '0 10px 25px -10px rgba(0, 0, 0, 0.15)',
        'soft-lg': '0 20px 45px -15px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
}