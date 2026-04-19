// /types/client.ts

// -----------------------------
// Shared Timestamp Type
// -----------------------------
export type Timestamp = string | null;

// -----------------------------
// License Type (FULL + CORRECT)
// -----------------------------
export type License = {
  id: string;
  userId: string;
  productName: string | null;
  licenseKey?: string; // some pages use this
  status: "ACTIVE" | "EXPIRED" | "PENDING";

  // Your DB uses camelCase, not snake_case
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Foreign key
  licenseRequestId: string | null;

  // Joined relation from Supabase
  license_request?: {
    id: string;
    requestKey: string;
  } | null;
};

// -----------------------------
// Invoice Type
// -----------------------------
export type Invoice = {
  id: string;
  userId: string;
  amount: number;
  status: "PAID" | "UNPAID" | "OVERDUE";
  createdAt: Timestamp;
  updatedAt?: Timestamp;
};

// -----------------------------
// Support Ticket Type
// -----------------------------
export type SupportTicket = {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

// -----------------------------
// User Profile Type
// -----------------------------
export type UserProfile = {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  role: "CLIENT" | "ADMIN" | "STAFF";
  createdAt: Timestamp;
};
