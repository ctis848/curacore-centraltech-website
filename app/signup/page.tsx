'use client';

import Link from 'next/link';
import { Mail, Lock, User } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-10">
      <div className="bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-xl border border-teal-200 max-w-md w-full">

        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center shadow-lg">
            <User className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-teal-900 mt-4">Create Account</h1>
          <p className="text-gray-600 mt-1">Join CentralCore EMR</p>
        </div>

        {/* FORM */}
        <form className="space-y-6">

          {/* FULL NAME */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="John Doe"
                className="w-full p-4 pl-10 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full p-4 pl-10 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full p-4 pl-10 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="w-full bg-teal-700 text-white py-4 rounded-xl font-semibold hover:bg-teal-800 transition"
          >
            Sign Up
          </button>
        </form>

        {/* FOOTER */}
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
