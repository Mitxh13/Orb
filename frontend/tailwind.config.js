/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orb: {
          50:  '#f0f8ff',
          100: '#e0f0ff',
          200: '#bce0ff',
          300: '#85caff',
          400: '#47b0ff',
          500: '#0079C1',
          600: '#005ea6',
          700: '#00457c',
          800: '#003087',
          900: '#001a4d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        'safe-b': 'env(safe-area-inset-bottom, 0px)',
      },
    },
  },
  plugins: [],
}
