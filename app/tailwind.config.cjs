/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF69B4',
        'accent-1': '#FFC0CB',
        'accent-2': '#FF1493',
        'accent-3': '#3B82F6',
        'background-light': '#FFF0F5',
        'background-dark': '#1A001A',
        surface: '#FFFFFF',
        'surface-dark': '#111827',
        'on-surface': '#111827',
        'on-surface-dark': '#E5E7EB',
        'text-light-primary': '#111827',
        'text-light-secondary': '#6b7280',
        'on-surface-light': '#202124',
        'on-surface-variant-light': '#5F6368',
      },
      fontFamily: {
        display: ['Fredoka', 'ui-sans-serif', 'system-ui'],
        body: ['Balsamiq Sans', 'cursive'],
        sans: ['Google Sans', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        soft: '0 10px 25px -10px rgba(0, 0, 0, 0.15)',
        'soft-lg': '0 20px 45px -15px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
}
