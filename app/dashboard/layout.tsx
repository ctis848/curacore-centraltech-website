"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const supabase = createSupabaseClient();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className={`${open ? "w-64" : "w-16"} bg-white shadow-md transition-all`}>
        <button
          onClick={() => setOpen(!open)}
          className="p-4 text-gray-600 hover:bg-gray-200 w-full text-left"
        >
          {open ? "Hide Menu" : "☰"}
        </button>

        {open && (
          <nav className="p-4 space-y-3">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/dashboard/licenses">Active Licenses</Link>
            <Link href="/dashboard/history">License History</Link>
            <Link href="/dashboard/machines">Machine History</Link>
            <Link href="/dashboard/invoices">Invoice History</Link>
            <Link href="/dashboard/settings">Settings</Link>

            <button
              onClick={logout}
              className="mt-6 text-red-600 hover:underline"
            >
              Logout
            </button>
          </nav>
        )}
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
