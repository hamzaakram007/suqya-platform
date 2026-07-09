/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0A6E6E', dark: '#085656' },
        accent: '#C9A227',
      },
    },
  },
  plugins: [],
};
