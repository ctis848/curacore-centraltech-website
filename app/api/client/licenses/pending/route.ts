import { NextResponse } from "next/server";

type License = {
  licenseKey: string;
  productName: string;
  status: "PENDING";
  requestedAt: string;
};

function getPendingLicenses(): License[] {
  const now = new Date();
  return [
    {
      licenseKey: "PEND-REQ-001",
      productName: "CentralCore Pro",
      status: "PENDING",
      requestedAt: now.toISOString(),
    },
  ];
}

export async function GET() {
  const licenses = getPendingLicenses();
  return NextResponse.json({ licenses });
}
