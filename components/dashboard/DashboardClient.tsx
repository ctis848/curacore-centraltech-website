"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function DashboardClient() {
  const supabase = supabaseBrowser();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function load() {
      // Load session user
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user;

      if (!currentUser) {
        setLoading(false);
        return;
      }

      setUser(currentUser);

      // Load client profile (if you have a Client table)
      const { data: profileData } = await supabase
        .from("Client")
        .select("*")
        .eq("userId", currentUser.id)
        .single();

      setProfile(profileData || null);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-gray-500">
        Loading your dashboard…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-red-600">
        Unable to load your account details.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Client Dashboard</h1>

      <div className="bg-white p-4 rounded shadow space-y-2">
        <p><strong>Email:</strong> {user.email}</p>

        {profile && (
          <>
            <p><strong>Name:</strong> {profile.fullName}</p>
            <p><strong>Company:</strong> {profile.companyName}</p>
            <p><strong>Phone:</strong> {profile.phone}</p>
          </>
        )}
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-3">Your Licenses</h2>
        <p className="text-gray-600">License list coming soon…</p>
      </div>
    </div>
  );
}
