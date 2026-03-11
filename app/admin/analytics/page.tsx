export const dynamic = "force-dynamic";
export const revalidate = 0;

import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export default async function AnalyticsPage() {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: licenseCount } = await supabase
    .from("licenses")
    .select("id", { count: "exact" });

  const { data: activeCount } = await supabase
    .from("licenses")
    .select("id", { count: "exact" })
    .eq("is_active", true);

  const { data: machineCount } = await supabase
    .from("machines")
    .select("id", { count: "exact" });

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Analytics Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
          <h2 className="text-xl font-bold">Total Licenses</h2>
          <p className="text-4xl mt-2">{licenseCount?.length ?? 0}</p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
          <h2 className="text-xl font-bold">Active Licenses</h2>
          <p className="text-4xl mt-2">{activeCount?.length ?? 0}</p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
          <h2 className="text-xl font-bold">Machines Registered</h2>
          <p className="text-4xl mt-2">{machineCount?.length ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
