import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const ua = req.headers.get("user-agent") || "unknown";

  console.log("Download logged:", {
    ip,
    ua,
    time: new Date().toISOString(),
  });

  return NextResponse.json({ status: "logged" });
}
