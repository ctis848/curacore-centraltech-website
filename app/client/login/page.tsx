'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Attempt login
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // ⭐ Force Supabase to write the session cookie
    await supabase.auth.getSession();

    // ⭐ Refresh so middleware sees the new cookie
    router.refresh();

    // ⭐ Redirect to the new dashboard route
    router.push('/client/client-panel');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 px-6">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-10 border border-gray-200">

        <h2 className="text-center text-3xl font-extrabold text-teal-800 mb-6">
          Sign in to CentralCore
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-3 border rounded-lg bg-gray-50 text-gray-900 focus:ring-teal-500 focus:border-teal-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-3 border rounded-lg bg-gray-50 text-gray-900 focus:ring-teal-500 focus:border-teal-500"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold shadow-md transition ${
              loading ? 'bg-teal-400' : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link href="/forgot-password" className="text-sm text-teal-700 hover:underline">
            Forgot Password?
          </Link>
        </div>

        <div className="text-center mt-6 text-gray-600 text-sm">
          Don’t have an account?{' '}
          <Link href="/auth/signup" className="text-teal-700 font-semibold hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
