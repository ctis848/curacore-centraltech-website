import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function logAdminAction(action: string, details: any = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return;

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || !session.user) return;

  await db.auditLog.create({
    data: {
      adminId: session.user.id,
      action,
      details: typeof details === "string" ? details : JSON.stringify(details),
    },
  });
}
