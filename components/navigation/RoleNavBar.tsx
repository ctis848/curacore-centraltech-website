"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function RoleNavBar() {
  const supabase = createClientComponentClient();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setRole(user?.user_metadata.role || null);
    }
    load();
  }, []);

  return (
    <nav className="bg-teal-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <Link href="/" className="text-2xl font-black">CTIS</Link>

        <div className="flex gap-6">
          <Link href="/features">Features</Link>
          <Link href="/services">Services</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/download">Download</Link>

          {role === "admin" && (
            <Link href="/admin" className="font-bold text-yellow-300">
              Admin Panel
            </Link>
          )}

          {role === "client" && (
            <Link href="/dashboard" className="font-bold text-green-300">
              Dashboard
            </Link>
          )}

          {!role && (
            <>
              <Link href="/auth/login">Login</Link>
              <Link
                href="/auth/signup"
                className="bg-white text-teal-800 px-4 py-2 rounded-lg font-semibold"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
