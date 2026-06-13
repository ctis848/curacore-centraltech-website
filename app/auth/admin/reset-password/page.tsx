"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PasswordRules from "@/components/PasswordRules";

export default function AdminResetPasswordPage() {
  const params = useSearchParams();
  const token = params?.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ⭐ Password strength validation
  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const strengthLabel = [
    "Very Weak",
    "Weak",
    "Fair",
    "Good",
    "Strong",
    "Very Strong",
  ][strength];

  const strengthColor = [
    "text-red-600",
    "text-orange-600",
    "text-yellow-600",
    "text-blue-600",
    "text-green-600",
    "text-green-700",
  ][strength];

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4 pt-24 pb-16">
          <div className="bg-white shadow-xl rounded-2xl p-8 border max-w-md w-full text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600">
              Invalid or Missing Reset Token
            </h1>
            <p className="text-slate-600 mb-6">
              Your password reset link is invalid or has expired.
            </p>
            <a
              href="/auth/admin/forgot-password"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Request a new reset link
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const res = await fetch("/api/auth/admin-reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setMsg(data.message || data.error);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-4 pt-24 pb-16">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl p-8 border">

          <h1 className="text-2xl font-bold text-center mb-4">
            Set New Password
          </h1>

          {msg && (
            <p className="text-center text-sm mb-4 text-blue-700">{msg}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                New Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* ⭐ Password Strength Indicator */}
              {password.length > 0 && (
                <p className={`mt-1 text-sm font-semibold ${strengthColor}`}>
                  Strength: {strengthLabel}
                </p>
              )}

              {/* ⭐ NEW: Password Rules Checklist */}
              <PasswordRules password={password} />
            </div>

            <button
              type="submit"
              disabled={loading || strength < 3} // Require at least "Good"
              className={`w-full py-3 rounded-lg text-white ${
                loading || strength < 3
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
