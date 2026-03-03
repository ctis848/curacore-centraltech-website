import { getUserAndRole } from "@/lib/auth/getUserAndRole";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const { user } = await getUserAndRole();

  if (!user) {
    return <meta httpEquiv="refresh" content="0; url=/auth/login" />;
  }

  return <DashboardClient user={user} />;
}
