"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type ActivityLog = {
  id: string;
  action: string;
  details: any;
  created_at: string;
};

export default function ActivityLogs() {
  const supabase = createClientComponentClient();
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false });

      setLogs((data as ActivityLog[]) || []);
    }

    load();
  }, [supabase]);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Activity Logs</h1>

      <div className="bg-white p-6 rounded-xl shadow">
        {logs.map((log) => (
          <div key={log.id} className="border-b py-3">
            <p className="font-semibold">{log.action}</p>
            <p className="text-gray-600 text-sm">{log.created_at}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
