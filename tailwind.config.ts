/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // or 'media' — choose one (class is more reliable for Next.js)

  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}', // if you use src/ folder
  ],

  theme: {
    extend: {
      colors: {
        // ────────────────────────────────────────────────
        // Define your CSS variables as Tailwind colors
        // This makes bg-background, text-foreground, etc. work
        // ────────────────────────────────────────────────
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        // Optional: add more if you use them elsewhere
        // border: 'hsl(var(--border))',
        // ring: 'hsl(var(--ring))',
        // input: 'hsl(var(--input))',
        // primary: 'hsl(var(--primary))',
        // etc.
      },
    },
  },

  plugins: [],
}