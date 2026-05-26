import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const paid = searchParams.get("paid") === "true";

    if (!id) {
      return NextResponse.json({ error: "Missing invoice ID" }, { status: 400 });
    }

    // TODO: Fetch invoice + service request data from Supabase
    // TODO: Generate PDF here

    return new NextResponse(
      `PDF generation placeholder. ID=${id}, PAID=${paid}`,
      {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
