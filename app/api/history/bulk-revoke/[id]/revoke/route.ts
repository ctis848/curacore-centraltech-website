import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Your existing logic goes here
    // Example:
    // await supabaseAdmin.from("history").update({ revoked: true }).eq("id", id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
