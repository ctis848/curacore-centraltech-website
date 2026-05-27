"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        window.location.href = "/admin";
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "Invalid credentials");
      }
    } catch {
      setErrorMsg("Unable to reach server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* ⭐ GLOBAL NAVBAR */}
      <Navbar />

      {/* ⭐ HERO SECTION WITH BLUR BACKGROUND */}
      <div className="relative w-full h-64 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 flex items-center justify-center mt-16">
        <div className="absolute inset-0 backdrop-blur-sm opacity-40"></div>

        <h1 className="relative text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
          CentralCore Admin Portal
        </h1>
      </div>

      {/* ⭐ LOGIN CARD */}
      <main className="flex-grow flex items-start justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-slate-200">

          <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">
            Admin Login
          </h2>

          {errorMsg && (
            <p className="text-red-600 text-sm text-center mb-4">
              {errorMsg}
            </p>
          )}

          <form onSubmit={handleLogin} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {/* FORGOT PASSWORD */}
            <div className="text-right">
              <a
                href="/auth/admin/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Forgot Password
              </a>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-lg font-bold rounded-lg shadow-lg transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* RETURN TO HOME */}
          <p className="text-center text-sm text-slate-600 mt-4">
            <a href="/" className="text-blue-600 hover:text-blue-800 underline">
              Return to Home Page
            </a>
          </p>
        </div>
      </main>

      {/* ⭐ GLOBAL FOOTER */}
      <Footer />
    </div>
  );
}
