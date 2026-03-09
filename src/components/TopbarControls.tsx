'use client';

import { useState, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import Link from 'next/link';

export default function TopbarControls() {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [dark]);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="fixed top-4 right-6 flex items-center gap-4 z-50">

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDark(!dark)}
        className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      >
        {dark ? 'Light' : 'Dark'}
      </button>

      {/* Profile Dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold"
        >
          {user?.email?.[0]?.toUpperCase()}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-2">
            <p className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
              {user?.email}
            </p>

            <Link
              href="/dashboard/settings"
              className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Settings
            </Link>

            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-700 text-red-600 dark:text-red-400"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
