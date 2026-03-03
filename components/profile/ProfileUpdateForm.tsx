"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfileUpdateForm({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleUpdate(e: any) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.target);

    const res = await fetch("/api/user/update", {
      method: "POST",
      body: JSON.stringify({
        userId,
        fullName: form.get("fullName"),
        phone: form.get("phone"),
        address: form.get("address"),
      }),
    });

    const data = await res.json();
    setLoading(false);

    alert(data.success ? "Profile updated!" : data.error);
  }

  return (
    <form onSubmit={handleUpdate} className="space-y-4 max-w-md mx-auto">
      <Input name="fullName" placeholder="Full Name" />
      <Input name="phone" placeholder="Phone Number" />
      <Input name="address" placeholder="Address" />
      <Button type="submit" disabled={loading}>
        {loading ? "Updating..." : "Update Profile"}
      </Button>
    </form>
  );
}
