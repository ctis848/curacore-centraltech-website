"use client";

import { useState, useEffect } from "react";

function UserSettingsForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/client/profile", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setName(data.user.name || "");
          setEmail(data.user.email || "");
        }
      });
  }, []);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    setMessage(null);

    const res = await fetch("/api/client/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email }),
    });

    const data = await res.json();
    setLoadingProfile(false);

    if (!res.ok) {
      setMessage({ type: "error", text: data.error || "Profile update failed." });
      return;
    }

    setMessage({ type: "success", text: "Profile updated successfully!" });
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPassword(true);
    setMessage(null);

    const res = await fetch("/api/client/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    const data = await res.json();
    setLoadingPassword(false);

    if (!res.ok) {
      setMessage({ type: "error", text: data.error || "Password update failed." });
      return;
    }

    setMessage({ type: "success", text: "Password updated successfully!" });
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <div className="space-y-10 mt-10">

      {message && (
        <div
          className={`p-3 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* PROFILE UPDATE */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Profile Settings
        </h3>

        <form onSubmit={updateProfile} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              placeholder="Enter your email"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loadingProfile}
            className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {loadingProfile ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>

      {/* PASSWORD UPDATE */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Change Password
        </h3>

        <form onSubmit={updatePassword} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              placeholder="Enter current password"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              placeholder="Enter new password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loadingPassword}
            className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {loadingPassword ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserSettingsForm;
