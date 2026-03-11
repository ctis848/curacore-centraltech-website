'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'client' }, // ⭐ Assign role
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.refresh();
    router.push('/client/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 px-6">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-10 border border-gray-200">

        <h2 className="text-center text-3xl font-extrabold text-teal-800 mb-6">
          Create Your Account
        </h2>

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-3 border rounded-lg bg-gray-50 text-gray-900 focus:ring-teal-500 focus:border-teal-500"
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
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-6 text-gray-600 text-sm">
          Already have an account?{' '}
          <Link href="/client/login" className="text-teal-700 font-semibold hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
