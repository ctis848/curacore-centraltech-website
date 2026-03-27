import { NextResponse } from "next/server";

export async function POST() {
  // Fake license object
  const license = {
    licenseKey: "TEST-123-ABC",
    productName: "Test Product",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // +30 days
  };

  return NextResponse.json({
    message: "Test license created successfully",
    license,
  });
}
