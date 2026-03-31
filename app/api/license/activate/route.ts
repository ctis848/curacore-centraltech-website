import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { sendMail } from "@/lib/mail";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { requestKey, productName, notes } = body;

    if (!requestKey) {
      return NextResponse.json(
        { error: "Missing machine/request key" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = session.user;

    // Prevent duplicate pending requests for same key
    const existing = await prisma.licenseRequest.findFirst({
      where: {
        userId: user.id,
        requestKey,
        status: "PENDING",
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You already submitted this request key. Await admin processing." },
        { status: 400 }
      );
    }

    // Create license request record
    const requestRecord = await prisma.licenseRequest.create({
      data: {
        userId: user.id,
        requestKey,
        productName,
        notes,
        status: "PENDING",
      },
    });

    // Notify admin by email
    await sendMail({
      to: "info@ctistech.com",
      subject: "New License Request",
      html: `
        <h2>New License Request</h2>
        <p><strong>User:</strong> ${user.email}</p>
        <p><strong>Request Key (Machine Key):</strong> ${requestKey}</p>
        ${
          productName
            ? `<p><strong>Product:</strong> ${productName}</p>`
            : ""
        }
        ${
          notes
            ? `<p><strong>Notes:</strong> ${notes}</p>`
            : ""
        }
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    return NextResponse.json({
      message: "License request submitted. Admin will generate your license.",
      request: requestRecord,
    });
  } catch (err: any) {
    console.error("License request error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
