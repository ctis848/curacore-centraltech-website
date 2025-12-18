// app/portal/login/page.tsx
'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@supabase/supabase-js';
import { useSearchParams } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const plan = searchParams.get('plan');

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-8">
          Client Portal Login
        </h2>

        {success === 'true' && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <p className="font-bold">Payment successful!</p>
            <p>Your {plan || 'plan'} license is active. Log in to access your dashboard.</p>
          </div>
        )}

        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light"
          providers={['google']}  // optional: Google login
          magicLink={true}  // ← THIS ENABLES MAGIC LINK
          view="magic_link" // optional: start with magic link view
        />
      </div>
    </div>
  );
}