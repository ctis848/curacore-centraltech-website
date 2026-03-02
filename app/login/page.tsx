'use client';

import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">

      <div className="bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-lg border border-teal-200 max-w-md w-full">
        <h1 className="text-4xl font-black text-teal-800 mb-8 text-center">Login</h1>

        <form className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-4 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-600"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-4 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-600"
          />

          <button
            type="submit"
            className="w-full bg-teal-700 text-white py-4 rounded-xl font-semibold hover:bg-teal-800 transition"
          >
            Login
          </button>
        </form>

        <p className="text-center text-gray-700 mt-6">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-teal-700 font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
