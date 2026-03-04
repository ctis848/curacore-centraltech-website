'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Lock, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
      return;
    }
    setChecking(false);
  }, [user, router]);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    alert("Account created! Check your email to verify your account.");
    router.push("/login");
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-teal-700 text-xl">
        Checking session...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-teal-100">

        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center shadow-lg">
            <UserPlus className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-teal-900 mt-4">Create Account</h1>
          <p className="text-gray-600 mt-1">Join CentralCore EMR</p>
        </div>

        {/* ERROR MESSAGE */}
        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {errorMsg}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleRegister} className="space-y-5">

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <Input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="pl-10"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold"
          >
            {loading ? "Creating..." : "Register"}
          </Button>
        </form>

        {/* FOOTER */}
        <div className="text-center mt-6 text-sm">
          <a href="/login" className="text-teal-700 font-semibold hover:underline">
            Already have an account? Login
          </a>
        </div>
      </div>
    </div>
  );
}
