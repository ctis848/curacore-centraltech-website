import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const history = await db.exportHistory.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(history);
  } catch (err) {
    console.error("EXPORT HISTORY API ERROR:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const record = await db.exportHistory.create({
      data: {
        fileName: body.fileName,
        dataset: body.dataset,
      },
    });

    return NextResponse.json(record);
  } catch (err) {
    console.error("EXPORT HISTORY POST ERROR:", err);
    return NextResponse.json(null, { status: 200 });
  }
}
