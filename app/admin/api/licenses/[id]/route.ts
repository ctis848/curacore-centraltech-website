import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  await db.license.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
