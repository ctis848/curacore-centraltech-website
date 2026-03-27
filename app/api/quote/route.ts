import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Email system removed, DB model removed — just return success
    return NextResponse.json({ success: true, received: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process quote" }, { status: 500 });
  }
}
