"use client";

import { useEffect, useState } from "react";

export default function ClientProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetch("/api/client/profile", { credentials: "include" })
      .then((res) => res.json())
      .then((d) => {
        setProfile(d.profile);
        setName(d.profile?.name || "");
      });
  }, []);

  async function updateProfile() {
    const res = await fetch("/api/client/profile/update", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    alert("Profile updated");
  }

  async function changePassword() {
    const res = await fetch("/api/client/profile/change-password", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    alert("Password changed");
    setPassword("");
  }

  if (!profile) return <p className="p-6">Loading profile...</p>;

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">My Profile</h1>

      {/* PROFILE INFO */}
      <div className="p-6 bg-white border rounded-lg shadow space-y-4">
        <h2 className="text-xl font-semibold">Account Information</h2>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Email</label>
          <input
            className="input bg-gray-100"
            value={profile.email}
            disabled
          />

          <label className="block text-sm font-medium">Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button
            onClick={updateProfile}
            className="px-4 py-2 bg-teal-700 text-white rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* PASSWORD CHANGE */}
      <div className="p-6 bg-white border rounded-lg shadow space-y-4">
        <h2 className="text-xl font-semibold">Change Password</h2>

        <div className="space-y-3">
          <input
            className="input"
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={changePassword}
            className="px-4 py-2 bg-teal-700 text-white rounded-lg"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
