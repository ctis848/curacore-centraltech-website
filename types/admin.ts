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
// LICENSE
// =========================

export interface LicenseRow {
  id: string;
  userId: string;
  productName: string | null;
  licenseKey: string | null;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  expiresAt: string | null;
  createdAt: string;
}

// =========================
// LICENSE REQUEST
// =========================

export interface LicenseRequestRow {
  id: string;
  userId: string;
  productName: string | null;
  requestKey: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;

  User?: {
    id: string;
    email: string;
    companyName: string | null;
  } | null;
}

// =========================
// APPROVED LICENSE (link between request and license)
// =========================

export interface ApprovedLicenseRow {
  id: string;
  licenseRequestId: string;
  licenseId: string;
  approvedAt: string;
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
