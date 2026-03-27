import { NextResponse } from "next/server";

type Invoice = {
  invoiceId: string;
  amount: number;
  currency: string;
  status: "PAID" | "UNPAID" | "OVERDUE";
  issuedAt: string;
  dueAt: string;
};

function getTestInvoices(): Invoice[] {
  const now = new Date();
  const plus30 = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);
  const minus10 = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10);

  return [
    {
      invoiceId: "INV-1001",
      amount: 199.99,
      currency: "USD",
      status: "PAID",
      issuedAt: minus10.toISOString(),
      dueAt: plus30.toISOString(),
    },
    {
      invoiceId: "INV-1002",
      amount: 499.00,
      currency: "USD",
      status: "UNPAID",
      issuedAt: now.toISOString(),
      dueAt: plus30.toISOString(),
    },
    {
      invoiceId: "INV-1003",
      amount: 129.50,
      currency: "USD",
      status: "OVERDUE",
      issuedAt: minus10.toISOString(),
      dueAt: minus10.toISOString(),
    },
  ];
}

export async function GET() {
  const invoices = getTestInvoices();
  return NextResponse.json({ invoices });
}
