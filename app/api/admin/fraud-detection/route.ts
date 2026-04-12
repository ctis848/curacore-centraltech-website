import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("validation_logs")
      .select("id, user_id, machine_id, product_name, status, created_at, ip_address")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("FRAUD DETECTION ERROR:", error);
      return NextResponse.json(
        { error: "Failed to load fraud data" },
        { status: 500 }
      );
    }

    const byIp: Record<string, number> = {};
    const machinesByUser: Record<string, Set<string>> = {};

    data.forEach((log: any) => {
      if (log.ip_address) {
        byIp[log.ip_address] = (byIp[log.ip_address] || 0) + 1;
      }
      if (log.user_id && log.machine_id) {
        if (!machinesByUser[log.user_id]) {
          machinesByUser[log.user_id] = new Set();
        }
        machinesByUser[log.user_id].add(log.machine_id);
      }
    });

    const suspiciousIps = Object.entries(byIp)
      .filter(([_, count]) => count >= 10)
      .map(([ip, count]) => ({ ip, count }));

    const suspiciousUsers = Object.entries(machinesByUser)
      .filter(([_, set]) => set.size >= 5)
      .map(([userId, set]) => ({ userId, machines: Array.from(set) }));

    return NextResponse.json({
      suspiciousIps,
      suspiciousUsers,
      recentLogs: data.slice(0, 50),
    });
  } catch (err: any) {
    console.error("FRAUD DETECTION SERVER ERROR:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
