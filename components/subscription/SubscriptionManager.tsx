"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SubscriptionManager({
  subscriptionId,
  userId,
}: {
  subscriptionId: string;
  userId: string;
}) {
  const [loading, setLoading] = useState(false);

  async function renew() {
    setLoading(true);
    const res = await fetch("/api/subscription/renew", {
      method: "POST",
      body: JSON.stringify({ subscriptionId, userId }),
    });
    const data = await res.json();
    setLoading(false);
    alert(data.success ? "Subscription renewed!" : data.error);
  }

  async function cancel() {
    setLoading(true);
    const res = await fetch("/api/subscription/cancel", {
      method: "POST",
      body: JSON.stringify({ subscriptionId, userId }),
    });
    const data = await res.json();
    setLoading(false);
    alert(data.success ? "Subscription cancelled!" : data.error);
  }

  return (
    <div className="space-x-4">
      <Button onClick={renew} disabled={loading}>
        Renew
      </Button>
      <Button variant="destructive" onClick={cancel} disabled={loading}>
        Cancel
      </Button>
    </div>
  );
}
