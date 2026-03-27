"use client";

import Link from "next/link";
import { FiSun, FiMoon } from "react-icons/fi";
import { useState, useEffect } from "react";

export default function AuthNavbar() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <nav className="w-full bg-white dark:bg-gray-800 shadow px-6 py-4 flex justify-between items-center">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-2xl font-black text-teal-700 dark:text-teal-300">CC</span>
        <span className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          CentralCore
        </span>
      </Link>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className="text-gray-700 dark:text-gray-200 text-2xl"
        >
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>
      </div>
    </nav>
  );
}
