'use client';

import { useUser } from '@supabase/auth-helpers-react';

export default function ProfilePage() {
  const user = useUser();

  if (!user) {
    return (
      <div className="p-10 text-center">
        <p>You are not logged in.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-10">
      <h1 className="text-3xl font-bold text-teal-700 mb-6">Your Profile</h1>

      <div className="bg-white shadow-lg rounded-xl p-6 border border-teal-100">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>User ID:</strong> {user.id}</p>
        <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
      </div>
    </div>
  );
}
