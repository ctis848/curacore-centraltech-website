/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // or 'media' — 'class' is usually better with Next.js

  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // Optional: add more if you use them later
        // border: 'hsl(var(--border))',
        // primary: 'hsl(var(--primary))',
      },
    },
  },

  plugins: [],
}