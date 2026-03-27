import { NextResponse } from "next/server";

export async function GET() {
  // Example static licenses (replace with DB query later)
  const licenses = [
    {
      licenseKey: "TEST-123-ABC",
      productName: "Test Product",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    },
  ];

  return NextResponse.json({ licenses });
}
