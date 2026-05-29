import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const revalidate = 60; // 60s cache for Next.js (ISR-style)

type Bucket = "DUE_3" | "DUE_7" | "DUE_30" | "EXPIRED" | "OTHER" | "UNKNOWN";

function getRenewalBucket(renewalDate: string | null): Bucket {
  if (!renewalDate) return "UNKNOWN";

  const now = new Date();
  const exp = new Date(renewalDate);

  now.setHours(0, 0, 0, 0);
  exp.setHours(0, 0, 0, 0);

  const diff = exp.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return "EXPIRED";
  if (days <= 3) return "DUE_3";
  if (days <= 7) return "DUE_7";
  if (days <= 30) return "DUE_30";
  return "OTHER";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.toLowerCase() || "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString().split("T")[0];

    const oneMonth = new Date();
    oneMonth.setDate(today.getDate() + 30);
    oneMonth.setHours(0, 0, 0, 0);
    const oneMonthISO = oneMonth.toISOString().split("T")[0];

    let query = supabaseAdmin
      .from("companies")
      .select("*")
      .not("renewal_date", "is", null)
      .gte("renewal_date", todayISO)
      .lte("renewal_date", oneMonthISO)
      .order("renewal_date", { ascending: true });

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Renewals fetch error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    const grouped = {
      DUE_3: [] as any[],
      DUE_7: [] as any[],
      DUE_30: [] as any[],
    };

    for (const company of data || []) {
      const bucket = getRenewalBucket(company.renewal_date);

      if (bucket === "DUE_3") grouped.DUE_3.push(company);
      else if (bucket === "DUE_7") grouped.DUE_7.push(company);
      else if (bucket === "DUE_30") grouped.DUE_30.push(company);
    }

    return NextResponse.json({
      success: true,
      grouped,
      counts: {
        DUE_3: grouped.DUE_3.length,
        DUE_7: grouped.DUE_7.length,
        DUE_30: grouped.DUE_30.length,
      },
    });
  } catch (err: any) {
    console.error("Renewals API error:", err);
    return NextResponse.json(
      { success: false, message: "Unexpected server error" },
      { status: 500 }
    );
  }
}
