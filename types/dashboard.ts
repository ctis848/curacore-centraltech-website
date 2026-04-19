// -----------------------------
// ENUM TYPES
// -----------------------------
export type LicenseStatus = "ACTIVE" | "EXPIRED" | "PENDING" | "INACTIVE";
export type InvoiceStatus = "PAID" | "UNPAID" | "OVERDUE";
export type TicketStatus = "OPEN" | "CLOSED" | "PENDING";

// -----------------------------
// LICENSE ROW
// -----------------------------
export interface LicenseRow {
  id: string;
  userId: string;

  // License lifecycle
  status: LicenseStatus;
  createdAt: string;
  expiresAt: string | null;     // ⭐ Required for renewal countdown
  activatedAt?: string | null;

  // Product details
  productName?: string | null;
  price?: number | null;        // ⭐ Required for renewal cost calculation

  // Machine binding
  machineId?: string | null;
  licenseKey?: string | null;   // Active license key
  requestKey?: string | null;   // Original request key

  // Admin processing
  processedBy?: string | null;
  processedAt?: string | null;
}

// -----------------------------
// INVOICE ROW
// -----------------------------
export interface InvoiceRow {
  id: string;
  userId: string;

  status: InvoiceStatus;
  amount: number;
  createdAt: string;
  dueDate?: string | null;

  // Payment details
  paidAt?: string | null;
  reference?: string | null;     // Paystack reference
  description?: string | null;
}

// -----------------------------
// SUPPORT TICKET ROW
// -----------------------------
export interface TicketRow {
  id: string;
  userId: string;

  status: TicketStatus;
  subject: string;
  message: string;
  createdAt: string;

  // Admin response
  adminReply?: string | null;
  repliedAt?: string | null;
}
