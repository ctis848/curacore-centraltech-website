import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  // Your activation logic
  await db.theme.update({
    where: { id },
    data: { active: true },
  });

  return NextResponse.json({ ok: true });
}
