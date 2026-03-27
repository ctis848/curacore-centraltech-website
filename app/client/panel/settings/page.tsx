"use client";

import { useEffect, useState } from "react";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  function getSessionToken() {
    return (
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("session="))
        ?.split("=")[1] || ""
    );
  }

  useEffect(() => {
    async function load() {
      try {
        const token = getSessionToken();

        const res = await fetch("/api/client/settings/profile", {
          headers: { "x-session-token": token },
        });

        const data = await res.json();

        if (!res.ok) {
          setProfile(null);
          setLoading(false);
          return;
        }

        setProfile(data);
        setName(data.name || "");
        setEmail(data.email || "");
      } catch (err) {
        console.error("Failed to load profile:", err);
      }

      setLoading(false);
    }

    load();
  }, []);

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null);

    const token = getSessionToken();

    const res = await fetch("/api/client/settings/update-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-token": token,
      },
      body: JSON.stringify({ name, email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setProfileMsg(data.error || "Failed to update profile");
      return;
    }

    setProfileMsg("Profile updated successfully!");
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);

    const token = getSessionToken();

    const res = await fetch("/api/client/settings/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-token": token,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setPasswordMsg(data.error || "Failed to change password");
      return;
    }

    setPasswordMsg("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
  }

  if (loading) {
    return (
      <DashboardClient>
        <p className="p-6">Loading settings...</p>
      </DashboardClient>
    );
  }

  return (
    <DashboardClient>
      <div className="p-6 max-w-3xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">Account Settings</h1>

        <div className="p-4 bg-white border rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Profile Information</h2>

          {profileMsg && (
            <p className="text-green-600 mb-2 font-medium">{profileMsg}</p>
          )}

          <form onSubmit={updateProfile} className="space-y-3">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded"
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded"
            />

            <button className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700">
              Update Profile
            </button>
          </form>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Change Password</h2>

          {passwordMsg && (
            <p className="text-green-600 mb-2 font-medium">{passwordMsg}</p>
          )}

          <form onSubmit={changePassword} className="space-y-3">
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-3 border rounded"
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border rounded"
            />

            <button className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700">
              Change Password
            </button>
          </form>
        </div>
      </div>
    </DashboardClient>
  );
}
