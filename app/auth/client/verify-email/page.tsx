"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = supabaseBrowser();

  const [status, setStatus] = useState("Verifying your email...");

  useEffect(() => {
    const token = params.get("code");
    const email = params.get("email");

    if (!token || !email) {
      setStatus("Invalid verification link.");
      return;
    }

    const verify = async () => {
      const { error } = await supabase.auth.verifyOtp({
        type: "email",
        token,
        email,
      });

      if (error) {
        setStatus("Verification failed. Link may be expired.");
      } else {
        setStatus("Email verified successfully! Redirecting...");
        setTimeout(() => router.replace("/auth/client/login"), 2000);
      }
    };

    verify();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-teal-700 dark:text-teal-300">
          Email Verification
        </h1>
        <p className="text-gray-700 dark:text-gray-300">{status}</p>
      </div>
    </div>
  );
}
