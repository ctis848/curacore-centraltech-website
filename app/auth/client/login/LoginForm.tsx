"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!email.includes("@")) {
      setError("Enter a valid email address");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/client-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      // Validate server response
      if (!data || !data.success) {
        setError("Unexpected server response. Try again.");
        setLoading(false);
        return;
      }

      // Redirect to client dashboard
      router.replace("/client/panel");
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6 text-teal-700 dark:text-teal-300">
        Client Login
      </h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          disabled={loading}
          className="w-full p-3 border rounded dark:bg-gray-700 dark:text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          disabled={loading}
          className="w-full p-3 border rounded dark:bg-gray-700 dark:text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="w-full bg-teal-600 text-white p-3 rounded hover:bg-teal-700 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="flex justify-between mt-4 text-sm">
        <button
          type="button"
          disabled={loading}
          onClick={() => router.push("/auth/client/forgot-password")}
          className="text-teal-600 hover:underline"
        >
          Forgot password
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => router.push("/auth/client/signup")}
          className="text-gray-600 dark:text-gray-300 hover:underline"
        >
          Create account
        </button>
      </div>
    </div>
  );
}
