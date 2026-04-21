"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const params = useSearchParams();

  const [status, setStatus] = useState("Verifying email…");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params) return;

    const token = params.get("code");
    const email = params.get("email");

    if (!token || !email) {
      setError("Invalid verification link");
      return;
    }

    verifyEmail(token, email);
  }, [params]);

  async function verifyEmail(token: string, email: string) {
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email }),
      });

      const data = await res.json();

      if (!data.success) {
        setError("Verification failed");
        return;
      }

      setStatus("Email verified successfully");
    } catch (err) {
      setError("Network error");
    }
  }

  return (
    <div className="p-6 text-center">
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <p>{status}</p>
      )}
    </div>
  );
}
