// lib/notifications.ts

// 1️⃣ PAYMENT NOTIFICATION
export async function sendPaymentNotification(data: {
  companyName: string;
  companyEmail: string;
  amount: number;
  paymentDate: string;
  paymentRef: string;
  paymentLink: string;
}) {
  const res = await fetch("/api/notifications/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
}

// 2️⃣ ANNUAL DUE REMINDER (30 DAYS OR 7 DAYS)
export async function sendAnnualReminder(data: {
  companyName: string;
  companyEmail: string;
  contactName: string;
  dueDate: string;
  planName: string;
  amountDue: number;
  paymentLink: string;
  type: "30days" | "7days";
}) {
  const res = await fetch("/api/notifications/annual-reminder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
}

// 3️⃣ LICENSE REQUEST NOTIFICATION
export async function sendLicenseRequestNotification(data: {
  userEmail: string;
  companyName: string;
  productName: string;
  requestKey: string;
  notes?: string;
}) {
  const res = await fetch("/api/notifications/license-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
}

// 4️⃣ LICENSE TRANSFER REQUEST NOTIFICATION
export async function sendLicenseTransferNotification(data: {
  currentOwner: string;
  newOwner: string;
  productName: string;
  licenseKey: string;
  reason: string;
}) {
  const res = await fetch("/api/notifications/license-transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
}

// 5️⃣ NEW COMPANY SIGNUP NOTIFICATION
export async function sendNewSignupNotification(data: {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  date: string;
}) {
  const res = await fetch("/api/notifications/new-signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
}
