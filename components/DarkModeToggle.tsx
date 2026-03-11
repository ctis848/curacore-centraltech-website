"use client";

import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("dark-mode") === "true";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);

  function toggle() {
    const newVal = !dark;
    setDark(newVal);
    localStorage.setItem("dark-mode", String(newVal));
    document.documentElement.classList.toggle("dark", newVal);
  }

  return (
    <button
      onClick={toggle}
      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black"
    >
      {dark ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
