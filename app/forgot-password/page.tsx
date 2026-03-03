'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
      return;
    }
    setChecking(false);
  }, [user, router]);

  const handleReset = async (e: any) => {
    e.preventDefault();

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    setSent(true);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-teal-700 text-xl">
        Checking session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-teal-900 flex items-center justify-center px-6">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 max-w-md w-full text-white">

        <h1 className="text-3xl font-black mb-6 text-center">Reset Password</h1>

        {sent ? (
          <p className="text-green-300 text-center">
            Reset link sent! Check your email.
          </p>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-xl bg-white/20 border border-white/30 text-white"
            />

            <button className="w-full py-4 bg-yellow-400 text-teal-900 font-bold rounded-xl text-xl">
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
