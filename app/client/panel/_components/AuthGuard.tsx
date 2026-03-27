"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch("/api/auth/me", { method: "GET", credentials: "include" });
        const data = await res.json();

        // Not logged in → redirect to login
        if (!res.ok || !data.user) {
          router.replace("/auth/client/login");          return;
        }

        // Logged in but NOT a client → unauthorized
        if (data.user.role !== "CLIENT") {
          router.replace("/unauthorized");
          return;
        }

        setChecking(false);
      } catch {
        router.replace("/auth/client/login");      }
    }

    verify();
  }, [router]);

  if (checking) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-600">
        Checking session...
      </div>
    );
  }

  return <>{children}</>;
}
