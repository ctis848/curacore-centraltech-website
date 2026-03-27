import { NextResponse } from "next/server";

type License = {
  licenseKey: string;
  productName: string;
  status: "EXPIRED";
  expiresAt: string;
};

function getExpiredLicenses(): License[] {
  const now = new Date();
  const minus30 = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30);

  return [
    {
      licenseKey: "EXP-TEST-001",
      productName: "CentralCore Pro",
      status: "EXPIRED",
      expiresAt: minus30.toISOString(),
    },
  ];
}

export async function GET() {
  const licenses = getExpiredLicenses();
  return NextResponse.json({ licenses });
}
