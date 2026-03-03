"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ActivateLicenseForm({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleActivate(e: any) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.target);

    const res = await fetch("/api/license/activate", {
      method: "POST",
      body: JSON.stringify({
        licenseKey: form.get("licenseKey"),
        machineId: form.get("machineId"),
        userId,
      }),
    });

    const data = await res.json();
    setLoading(false);

    alert(data.success ? "License activated!" : data.error);
  }

  return (
    <form onSubmit={handleActivate} className="space-y-4 max-w-md mx-auto">
      <Input name="licenseKey" placeholder="License Key" required />
      <Input name="machineId" placeholder="Machine ID" required />
      <Button type="submit" disabled={loading}>
        {loading ? "Activating..." : "Activate License"}
      </Button>
    </form>
  );
}
