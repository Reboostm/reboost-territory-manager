/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
        },
        dark: {
          800: '#1e1e2e',
          900: '#13131f',
          950: '#0d0d16',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      }
    },
  },
  plugins: [],
}
