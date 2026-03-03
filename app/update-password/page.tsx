'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
      return;
    }
    setChecking(false);
  }, [user, router]);

  const handleUpdate = async (e: any) => {
    e.preventDefault();

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      alert(error.message);
      return;
    }

    setUpdated(true);
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

        <h1 className="text-3xl font-black mb-6 text-center">Set New Password</h1>

        {updated ? (
          <p className="text-green-300 text-center">
            Password updated! You can now log in.
          </p>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-6">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-xl bg-white/20 border border-white/30 text-white"
            />

            <button className="w-full py-4 bg-yellow-400 text-teal-900 font-bold rounded-xl text-xl">
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
