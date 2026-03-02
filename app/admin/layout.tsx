// app/admin/layout.tsx
'use client';

import { useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    // Replace with your own admin check (role column, etc.)
    if (user.email !== 'admin@yourcompany.com') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user) return <p className="mt-20 text-center">Loading...</p>;

  return <div className="max-w-6xl mx-auto pt-28 px-6 pb-20">{children}</div>;
}
