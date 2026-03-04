"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "allowed" | "denied">("checking");
  const router = useRouter();

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();

        if (!active) return;

        if (!data.user) {
          setStatus("denied");
          router.replace("/login");
        } else {
          setStatus("allowed");
        }
      } catch (err) {
        setStatus("denied");
        router.replace("/login");
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center text-teal-700 text-lg">
        Checking authentication…
      </div>
    );
  }

  if (status === "denied") return null;

  return <>{children}</>;
}
