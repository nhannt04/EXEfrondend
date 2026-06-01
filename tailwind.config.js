/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#F8FBFF',
        'dark-card': '#FFFFFF',
        'dark-border': 'rgba(37, 99, 235, 0.12)',
        'heritage-amber': '#2563EB',
        'heritage-dark': '#1D4ED8',
        'heritage-gold': '#60A5FA',
        'ricefield-green': '#1D4ED8',
        'ricefield-light': '#3B82F6',
        'ricefield-dark': '#1E3A8A',
      },
      fontFamily: {
        outfit: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        inter: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


