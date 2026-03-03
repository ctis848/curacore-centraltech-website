"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

interface License {
  id: string;
  license_key: string;
  product_name: string;
  max_machines: number;
  machines_used: number;
  status: string;
  start_date: string;
  end_date: string;
}

export default function LicensePage() {
  const supabase = createSupabaseClient();
  const [licenses, setLicenses] = useState<License[]>([]); // FIXED

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("licenses")
        .select("*")
        .eq("client_id", user.id);

      if (data) setLicenses(data); // FIXED
    }

    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Licenses</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {licenses.map((lic) => (
          <div key={lic.id} className="p-4 bg-white shadow rounded">
            <h2 className="font-semibold">{lic.product_name}</h2>
            <p>License Key: {lic.license_key}</p>
            <p>Machines: {lic.machines_used} / {lic.max_machines}</p>
            <p>Status: {lic.status}</p>
            <p>Expires: {lic.end_date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
