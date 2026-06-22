/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
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
        gray: {
          150: '#eceeef',
          250: '#dbe0e3',
          350: '#b8c0c5',
          450: '#8b97a0',
          550: '#64748b',
          650: '#475569',
          750: '#334155',
          850: '#1e293b',
          950: '#0f172a',
        },
        red: {
          250: '#fca5a5',
          650: '#dc2626',
        },
        blue: {
          250: '#93c5fd',
          650: '#2563eb',
        },
        green: {
          250: '#86efac',
          650: '#16a34a',
        },
        amber: {
          650: '#d97706',
        }
      },
      fontFamily: {
        outfit: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        inter: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


