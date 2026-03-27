import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const tenants = await db.tenant.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tenants);
  } catch (err) {
    console.error("TENANTS API ERROR:", err);
    return NextResponse.json([], { status: 200 });
  }
}
