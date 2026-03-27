"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const supabase = createSupabaseClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/client/login");
        return;
      }

      setEmail(user.email || "");
    }

    load();
  }, []);

  async function updateEmail() {
    const { error } = await supabase.auth.updateUser({ email });
    setMessage(error ? error.message : "Email updated successfully.");
  }

  async function updatePassword() {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setMessage(error ? error.message : "Password updated successfully.");
  }

  return (
    <div className="p-6 space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
        <h2 className="text-xl font-semibold">Profile</h2>

        <label className="block">
          <span>Email</span>
          <input
            className="w-full p-2 border rounded mt-1 dark:bg-gray-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <button
          onClick={updateEmail}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Update Email
        </button>

        <h2 className="text-xl font-semibold pt-4">Change Password</h2>

        <label className="block">
          <span>New Password</span>
          <input
            type="password"
            className="w-full p-2 border rounded mt-1 dark:bg-gray-700"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>

        <button
          onClick={updatePassword}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Update Password
        </button>

        {message && <p className="text-blue-600 mt-4">{message}</p>}
      </div>
    </div>
  );
}
