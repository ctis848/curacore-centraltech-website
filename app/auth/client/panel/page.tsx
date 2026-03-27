import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function ClientPanelPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/client/login");
  }

  return <DashboardClient />;
}
