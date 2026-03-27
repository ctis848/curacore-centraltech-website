import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export async function roleGuard(allowedRoles: string[]) {
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

  const role = session.user.role;

  if (!allowedRoles.includes(role)) {
    redirect("/unauthorized");
  }

  return session.user;
}
