"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { useRouter } from "next/navigation";

type ActiveLicense = {
  id: string;
  license_key: string;
  machine_id: string;
  activated_at: string | null;
  expires_at: string | null;
  status: string;
};

export default function ActiveLicensesPage() {
  const supabase = createSupabaseClient();
  const router = useRouter();

  const [licenses, setLicenses] = useState<ActiveLicense[]>([]);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/client/login");
        return;
      }

      const { data } = await supabase
        .from("licenses")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active");

      if (data) setLicenses(data as ActiveLicense[]);
    }

    load();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Active Licenses</h1>
      <DataTable columns={columns} data={licenses} />
    </div>
  );
}
