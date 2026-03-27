import { redirect } from "next/navigation";
import { getUserAndRole } from "./getUserAndRole";
import { Role } from "@prisma/client";

export async function requireAdmin() {
  const { user, role } = await getUserAndRole();

  if (!user || role !== Role.ADMIN) {
    redirect("/auth/admin/login");
  }
}
