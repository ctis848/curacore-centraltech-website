import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const themes = await db.theme.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(themes);
  } catch (err) {
    console.error("THEMES API ERROR:", err);
    return NextResponse.json([], { status: 200 });
  }
}
