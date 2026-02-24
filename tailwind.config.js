/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode - Espresso (text)
        'espresso': {
          950: '#1a1412',
          900: '#2d2622',
          800: '#3d332d',
          700: '#524840',
        },
        // Light mode - Crema (backgrounds)
        'crema': {
          50: '#faf8f5',
          100: '#f5f1eb',
          200: '#ebe5db',
          300: '#d9d0c3',
          400: '#c4b8a8',
        },
        // Dark mode - Roast (backgrounds)
        'roast': {
          950: '#0f0d0c',
          900: '#1a1613',
          800: '#252019',
          700: '#332b24',
          600: '#443a30',
        },
        // Dark mode - Steam (text)
        'steam': {
          50: '#faf8f5',
          100: '#e8e2d9',
          200: '#c9c0b3',
          300: '#a69c8c',
          400: '#7a7067',
        },
        // Accent - Caramel
        'caramel': {
          100: '#fdf4e7',
          200: '#f9e4c8',
          300: '#f0cea3',
          400: '#d4a574',
          500: '#b8865a',
          600: '#996d45',
        },
        // Success - Dialed
        'dialed': {
          light: '#e8f0e8',
          DEFAULT: '#7d9a7d',
          dark: '#5c755c',
          'dm-bg': '#1e2a1e',
          'dm-text': '#9db89d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
