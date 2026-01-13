// app/portal/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types (matched to your real activation_codes table)
interface UserProfile {
  email: string | null;
}

interface ActivationCode {
  id: string;
  user_id: string;
  code: string;
  expires_at: string;
  used: boolean;
}

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activationCodes, setActivationCodes] = useState<ActivationCode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error('No authenticated user found - please log in');
        }

        if (isMounted) {
          setUserProfile({
            email: user.email ?? null,
          });
        }

        // Fetch activation codes using correct table and column (user_id UUID)
        const { data: codes, error: codesError } = await supabase
          .from('activation_codes')          // ← your real table name
          .select('id, user_id, code, expires_at, used')
          .eq('user_id', user.id);           // ← correct column: user_id (UUID)

        if (codesError) {
          throw new Error(`Activation codes query failed: ${codesError.message}`);
        }

        if (isMounted) {
          setActivationCodes(codes || []);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
        console.error('Dashboard load error:', message, err);
        if (isMounted) setError(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-white">
        <p className="text-2xl text-teal-900 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-white">
        <p className="text-2xl text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 p-8 bg-gradient-to-b from-teal-50 to-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-black text-teal-900 mb-12 text-center">
          CentralCore Client Dashboard
        </h1>

        {/* User Info */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-teal-100 mb-12 text-center">
          <h2 className="text-3xl font-bold text-teal-900 mb-6">Welcome Back</h2>
          <p className="text-xl text-teal-800 mb-4">
            Email: <strong>{userProfile?.email || 'Not available'}</strong>
          </p>
        </div>

        {/* Activation Codes Section */}
        <section className="bg-white rounded-3xl p-8 shadow-2xl border border-teal-100">
          <h2 className="text-4xl font-bold text-teal-900 mb-8 text-center">
            Your Activation Codes
          </h2>

          {activationCodes.length === 0 ? (
            <p className="text-gray-600 text-center text-lg">
              No activation codes found yet. Purchase a license to generate one.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-teal-100">
                    <th className="p-4">Code</th>
                    <th className="p-4">Expires At</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activationCodes.map((code) => (
                    <tr key={code.id} className="border-b hover:bg-teal-50">
                      <td className="p-4 font-mono">{code.code}</td>
                      <td className="p-4">
                        {new Date(code.expires_at).toLocaleString()}
                      </td>
                      <td className="p-4">
                        {code.used ? (
                          <span className="text-red-600 font-medium">Used</span>
                        ) : (
                          <span className="text-green-600 font-medium">Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}