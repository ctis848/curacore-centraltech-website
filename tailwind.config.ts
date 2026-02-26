/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  darkMode: "class",

  theme: {
    extend: {
      colors: {
        // These MUST be here so Tailwind generates bg-background, text-foreground, etc.
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Optional but prevents future errors if you add more @apply
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: "hsl(var(--primary))",
        muted: "hsl(var(--muted))",
      },
    },
  },

  plugins: [],
}