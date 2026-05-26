/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#FAF9F5',
        'dark-card': '#FFFFFF',
        'dark-border': 'rgba(0, 0, 0, 0.07)',
        'heritage-amber': '#D97706',
        'heritage-dark': '#92400E',
        'heritage-gold': '#F59E0B',
        'ricefield-green': '#15803D',
        'ricefield-light': '#22C55E',
        'ricefield-dark': '#14532D',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

