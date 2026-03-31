"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Load theme on mount
  useEffect(() => {
    const stored = localStorage.getItem("admin-theme");

    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      document.documentElement.classList.toggle("dark", stored === "dark");
    } else {
      // Sync with system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = prefersDark ? "dark" : "light";
      setTheme(initial);
      document.documentElement.classList.toggle("dark", initial === "dark");
      localStorage.setItem("admin-theme", initial);
    }

    setMounted(true);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("admin-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  // Prevent hydration mismatch
  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      className="
        px-3 py-1 rounded flex items-center gap-2
        bg-gray-200 dark:bg-gray-700 
        text-gray-800 dark:text-gray-100
        hover:bg-gray-300 dark:hover:bg-gray-600
        transition
      "
    >
      {theme === "dark" ? (
        <>
          {/* Light Mode Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 
              6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 
              0l-.707.707M6.343 17.657l-.707.707M12 8a4 
              4 0 100 8 4 4 0 000-8z"
            />
          </svg>
          Light Mode
        </>
      ) : (
        <>
          {/* Dark Mode Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M21 12.79A9 9 0 1111.21 3 
              7 7 0 0021 12.79z"
            />
          </svg>
          Dark Mode
        </>
      )}
    </button>
  );
}
