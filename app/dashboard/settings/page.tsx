"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

interface Profile {
  full_name: string | null;
}

export default function SettingsPage() {
  const supabase = createSupabaseClient();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || "");

      const { data: profileData } = await supabase
        .from("clients")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      if (profileData) {
        setFullName(profileData.full_name || "");
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  async function updateProfile() {
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("clients")
      .update({ full_name: fullName })
      .eq("user_id", user.id);

    setMessage("Profile updated successfully.");
  }

  async function updateEmail() {
    setMessage("");

    const { error } = await supabase.auth.updateUser({ email });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Email update request sent. Check your inbox.");
  }

  async function resetPassword() {
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password reset email sent.");
  }

  if (loading) {
    return <p className="p-6">Loading settings...</p>;
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {message && (
        <p className="mb-4 text-green-600 font-medium">{message}</p>
      )}

      <div className="bg-white p-6 shadow rounded border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Profile</h2>

        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          type="text"
          className="w-full p-3 border rounded mb-4"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <button
          onClick={updateProfile}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Profile
        </button>
      </div>

      <div className="bg-white p-6 shadow rounded border border-gray-200 mt-6">
        <h2 className="text-xl font-semibold mb-4">Account</h2>

        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          className="w-full p-3 border rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={updateEmail}
          className="bg-blue-600 text-white px-4 py-2 rounded mr-3"
        >
          Update Email
        </button>

        <button
          onClick={resetPassword}
          className="bg-gray-700 text-white px-4 py-2 rounded"
        >
          Reset Password
        </button>
      </div>
    </div>
  );
}
