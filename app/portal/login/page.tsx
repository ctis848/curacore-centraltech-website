// app/portal/login/page.tsx
'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';

export default function Login() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">
            Client Portal Login
          </h2>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="light"
            providers={['google']}
            redirectTo="https://heroic-melomakarona-332c0d.netlify.app/portal/dashboard"
          />
        </div>
      </div>
    </>
  );
}