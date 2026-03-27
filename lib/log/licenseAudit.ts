import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function auditLicenseChange(
  licenseId: string,
  oldData: any,
  newData: any
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return;

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || !session.user) return;

  await db.licenseHistory.create({
    data: {
      licenseId,
      action: "UPDATED",
      details: JSON.stringify({
        adminId: session.user.id,
        old: oldData,
        new: newData,
      }),
    },
  });
}
