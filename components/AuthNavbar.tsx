"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AuthNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const titleMap: Record<string, string> = {
    "/login": "Login",
    "/signup": "Signup",
    "/forgot-password": "Forgot Password",
    "/reset-password": "Reset Password",
  };

  const title = titleMap[pathname] ?? "Account";

  // Dark mode toggle
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <div className="mb-8 flex items-center justify-between">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="text-sm text-blue-600 hover:underline"
      >
        Back
      </button>

      {/* Logo + Title */}
      <div className="text-center flex-1">
        <div className="flex flex-col items-center">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-10 h-10 mb-1"
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDark(!dark)}
        className="text-sm text-gray-700 dark:text-gray-300"
      >
        {dark ? "☀️" : "🌙"}
      </button>
    </div>
  );
}
