'use client';

import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">

      <div className="bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-lg border border-teal-200 max-w-md w-full">
        <h1 className="text-4xl font-black text-teal-800 mb-8 text-center">Create Account</h1>

        <form className="space-y-6">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-4 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-600"
          />

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
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-700 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-teal-700 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
