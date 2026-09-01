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
          50: '#f0f8ff',
          100: '#e0f0ff',
          200: '#bce0ff',
          300: '#85caff',
          400: '#47b0ff',
          500: '#0079C1', // PayPal light blue
          600: '#005ea6',
          700: '#00457c',
          800: '#003087', // PayPal dark blue
          900: '#001a4d',
        },
      },
      animation: {
        'draw': 'draw 0.5s ease-out forwards',
        'fly': 'fly 1s ease-in-out forwards',
      },
      keyframes: {
        draw: {
          '0%': { strokeDasharray: '0, 100' },
          '100%': { strokeDasharray: '100, 100' },
        },
        fly: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: 1 },
          '50%': { transform: 'translateY(-20px) scale(1.1)', opacity: 1 },
          '100%': { transform: 'translateY(-100px) scale(0)', opacity: 0 },
        }
      }
    },
  },
  plugins: [],
}
