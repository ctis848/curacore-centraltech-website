'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // If user is already logged in, redirect immediately
    if (user) {
      router.replace('/dashboard');
      return;
    }

    // If no user, stop loading and show login form
    setChecking(false);
  }, [user, router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-teal-700 text-xl">
        Checking session...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

        <LoginForm />

        <div className="text-center mt-4 text-sm">
          <a href="/forgot-password" className="text-teal-600 hover:underline">
            Forgot password?
          </a>
        </div>

        <div className="text-center mt-2 text-sm">
          <a href="/register" className="text-gray-600 hover:underline">
            Create an account
          </a>
        </div>
      </div>
    </div>
  );
}
