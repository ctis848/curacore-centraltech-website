"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/login");
        return;
      }

      setSessionUser(data.user);
      setChecking(false);
    }

    load();
  }, [router, supabase]);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Password updated successfully.");
    router.push("/dashboard");
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Checking session...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Update Password
        </h1>

        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            name="password"
            type="password"
            placeholder="New Password"
            required
            className="w-full border p-2 rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-2 rounded"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
