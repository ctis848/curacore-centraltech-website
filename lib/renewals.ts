// lib/renewals.ts

export type RenewalBucket = "DUE_3" | "DUE_7" | "DUE_30" | "EXPIRED" | "OTHER" | "UNKNOWN";

export function getRenewalInfo(renewalDate: string | null) {
  if (!renewalDate) {
    return {
      days: null,
      bucket: "UNKNOWN" as RenewalBucket,
      label: "Unknown",
    };
  }

  const now = new Date();
  const exp = new Date(renewalDate);

  // Normalize time to avoid timezone drift
  now.setHours(0, 0, 0, 0);
  exp.setHours(0, 0, 0, 0);

  const diff = exp.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  // ⭐ Mutually exclusive buckets
  if (days < 0) {
    return {
      days,
      bucket: "EXPIRED" as RenewalBucket,
      label: "Expired",
    };
  }

  if (days <= 3) {
    return {
      days,
      bucket: "DUE_3" as RenewalBucket,
      label: "Due in 3 days",
    };
  }

  if (days <= 7) {
    return {
      days,
      bucket: "DUE_7" as RenewalBucket,
      label: "Due in 7 days",
    };
  }

  if (days <= 30) {
    return {
      days,
      bucket: "DUE_30" as RenewalBucket,
      label: "Due in 30 days",
    };
  }

  return {
    days,
    bucket: "OTHER" as RenewalBucket,
    label: `${days} days remaining`,
  };
}
