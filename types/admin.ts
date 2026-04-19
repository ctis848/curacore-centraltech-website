// FILE: types/admin.ts

// =========================
// ENUM TYPES
// =========================

export type LicenseStatus = "ACTIVE" | "INACTIVE" | "EXPIRED";
export type InvoiceStatus = "PAID" | "UNPAID" | "OVERDUE";
export type TicketStatus = "OPEN" | "CLOSED" | "PENDING";
export type PaymentStatus = "PENDING" | "PAID";
export type TicketCategory = "GENERAL" | "BILLING" | "TECHNICAL" | "LICENSING";

// =========================
// LICENSE
// =========================

export interface LicenseRow {
  id: string;
  userId: string;
  productName: string | null;
  licenseKey: string | null;
  expiresAt: string | null;
  status: LicenseStatus;
  annualFeePercent: number;
  annualFeePaidUntil: string | null;
  createdAt: string;
  updatedAt?: string;
}

// =========================
// LICENSE REQUEST
// =========================
// ⭐ FIXED: requestKey is ALWAYS a string
// This removes the TypeScript error in your table.

export interface LicenseRequestRow {
  id: string;
  userId: string;
  productName: string | null;
  requestKey: string; // FIXED (was string | null)
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt?: string;
}

// =========================
// INVOICE
// =========================

export interface InvoiceRow {
  id: string;
  userId: string;
  amount: number;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt?: string;
}

// =========================
// SUPPORT TICKET
// =========================

export interface TicketRow {
  id: string;
  userId: string;
  subject: string;
  message: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  category: TicketCategory;
  status: TicketStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface TicketReplyRow {
  id: string;
  ticketId: string;
  userId: string | null;
  isFromAdmin: boolean;
  message: string;
  createdAt: string;
}

// =========================
// PAYMENT
// =========================

export interface PaymentRow {
  id: string;
  userId: string;
  licenseId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description: string;
  createdAt: string;
  paidAt: string | null;
  updatedAt?: string;
}
