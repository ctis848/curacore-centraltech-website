"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (!name.trim()) return "Name is required.";
    if (!email.includes("@")) return "Enter a valid email address.";
    if (password.length < 6)
      return "Password must be at least 6 characters long.";
    if (password !== confirmPassword)
      return "Passwords do not match.";
    return null;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.includes("already registered")) {
          setError("This email is already registered. Try logging in.");
        } else {
          setError(data.error || "Signup failed. Please try again.");
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // Optional: Auto redirect after 3 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);

    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Create an Account">
      {success ? (
        <div className="text-center animate-fade-in">
          <h2 className="text-xl font-semibold text-teal-700 mb-2">
            Check Your Email
          </h2>
          <p className="text-gray-700">
            We sent you a verification link. Click it to activate your account.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSignup} className="space-y-4">

          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-semibold ${
              loading ? "bg-gray-400" : "bg-teal-600 hover:bg-teal-700"
            }`}
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>
      )}

      <p className="text-center mt-4 text-sm">
        Already have an account?{" "}
        <a href="/auth/login" className="text-teal-600 hover:underline">
          Login
        </a>
      </p>
    </AuthCard>
  );
}
