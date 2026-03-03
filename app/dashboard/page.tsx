// app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { getUserAndRole } from '@/lib/auth/getUserAndRole';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const result = await getUserAndRole();

  // Early return with redirect if no user
  if (!result.user) {
    redirect('/auth/login');
  }

  // Pass the full user + role to client component
  return <DashboardClient user={result.user} role={result.role} />;
}