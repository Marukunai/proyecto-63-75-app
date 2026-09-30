/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#090d16',
          card: '#131b2e',
          border: '#1e293b',
          accent: '#38bdf8',
        },
      },
    },
  },
  plugins: [],
};