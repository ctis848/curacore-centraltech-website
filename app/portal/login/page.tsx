// app/portal/login/page.tsx
import { Suspense } from 'react';
import LoginContent from './LoginContent';

export default function LoginPage() {
  
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <LoginContent />
    </Suspense>
  );
}