import { NextResponse } from "next/server";

type LicenseHistory = {
  id: string;
  licenseKey: string;
  productName: string;
  action: "CREATED" | "RENEWED" | "SUSPENDED" | "REVOKED";
  timestamp: string;
};

function getTestLicenseHistory(): LicenseHistory[] {
  const now = new Date();
  const minus5 = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5);
  const minus20 = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 20);

  return [
    {
      id: "HIST-001",
      licenseKey: "ACTIVE-TEST-001",
      productName: "CentralCore Pro",
      action: "RENEWED",
      timestamp: minus5.toISOString(),
    },
    {
      id: "HIST-002",
      licenseKey: "ACTIVE-TEST-002",
      productName: "CentralCore Analytics",
      action: "CREATED",
      timestamp: minus20.toISOString(),
    },
  ];
}

export async function GET() {
  const history = getTestLicenseHistory();
  return NextResponse.json({ history });
}
