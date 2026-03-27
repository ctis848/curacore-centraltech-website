import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export async function tenantAdminGuard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const user = session.user;
  const role = user.role;

  // Only ADMIN or SUPERADMIN allowed
  const allowedRoles = new Set<Role>([Role.ADMIN, Role.SUPERADMIN]);

  if (!allowedRoles.has(role)) {
    redirect("/unauthorized");
  }

  return { user };
}
