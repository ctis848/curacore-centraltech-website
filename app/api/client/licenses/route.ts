import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ licenses: [] });
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session?.user) {
    return NextResponse.json({ licenses: [] });
  }

  const licenses = await prisma.license.findMany({
    where: { userId: session.user.id },
    select: {
      licenseKey: true,
      productName: true,
      status: true,
      expiresAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ licenses });
}
