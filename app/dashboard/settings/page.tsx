'use client';

import { useUser } from '@supabase/auth-helpers-react';

export default function SettingsPage() {
  const user = useUser();

  if (!user) return <p className="mt-20 text-center">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-teal-900 mb-10">Settings</h1>

      <div className="bg-white shadow-lg rounded-2xl p-8 border border-teal-100 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Account Information</h2>
          <p><strong>Email:</strong> {user.email}</p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-2">Security</h2>
          <p>Password reset and 2FA options coming soon.</p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-2">Notifications</h2>
          <p>Manage email alerts and subscription reminders.</p>
        </div>
      </div>
    </div>
  );
}
