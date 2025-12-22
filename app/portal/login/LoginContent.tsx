// app/portal/login/LoginContent.tsx
'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@supabase/supabase-js';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const plan = searchParams.get('plan');
  const router = useRouter();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/portal/dashboard');
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center py-12 px-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-12 border border-teal-100">
        <h2 className="text-5xl font-black text-teal-900 text-center mb-10">
          Client Portal
        </h2>
        <p className="text-xl text-gray-700 text-center mb-10">
          Log in to manage your CuraCore EMR license
        </p>

        {success === 'true' && (
          <div className="bg-green-100 border-2 border-green-500 text-green-800 px-6 py-5 rounded-2xl mb-10 text-center">
            <p className="font-bold text-2xl mb-2">Payment Successful! 🎉</p>
            <p className="text-lg">
              Your <strong>{plan || 'plan'}</strong> license is now active.
            </p>
          </div>
        )}

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#0d9488', // teal-600
                  brandAccent: '#14b8a6', // teal-500
                  brandButtonText: '#ffffff',
                  defaultButtonBackground: '#ffffff',
                  defaultButtonBackgroundHover: '#f0fdfa',
                  defaultButtonBorder: '#0d9488',
                  defaultButtonText: '#0d9488',
                  dividerBackground: '#e0f2f1',
                  inputBackground: '#ffffff',
                  inputBorder: '#0d9488',
                  inputBorderHover: '#14b8a6',
                  inputBorderFocus: '#14b8a6',
                  inputText: '#0f172a',
                  inputLabelText: '#0f172a',
                  inputPlaceholder: '#94a3b8',
                },
              },
            },
            style: {
              button: { borderRadius: '0.75rem', fontWeight: '600' },
              input: { borderRadius: '0.75rem', padding: '0.75rem 1rem' },
              label: { fontWeight: '600' },
              container: { marginTop: '1rem' },
            },
          }}
          theme="light"
          providers={[]}  // Empty array = No social providers (Google removed)
          magicLink={true} // Keeps passwordless Magic Link login
          redirectTo="https://curacore-centraltech-website.netlify.app/portal/dashboard"
        />
      </div>
    </div>
  );
}