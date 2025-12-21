// app/portal/login/page.tsx
import { Suspense } from 'react';
import LoginContent from './LoginContent';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-teal-50">
        <p className="text-2xl text-teal-900 font-bold">Loading portal...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}