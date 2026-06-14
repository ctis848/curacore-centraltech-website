import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// -----------------------------------------------------
// TYPES
// -----------------------------------------------------
type Bucket = "DUE_3" | "DUE_7" | "DUE_30" | "EXPIRED" | "OTHER" | "UNKNOWN";

interface CompanyRow {
  id: string;
  name: string;
  renewal_date: string | null;
  annual_price: number | null;
  license_count: number | null;
}

// -----------------------------------------------------
// BUCKET LOGIC
// -----------------------------------------------------
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

// -----------------------------------------------------
// MAIN HANDLER
// -----------------------------------------------------
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("companies")
      .select("id, name, renewal_date, annual_price, license_count");

    if (error) {
      console.error("Renewals analytics error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    const companies: CompanyRow[] = data || [];

    // -----------------------------------------------------
    // BUCKET COUNTS
    // -----------------------------------------------------
    const buckets: Record<Bucket, number> = {
      DUE_3: 0,
      DUE_7: 0,
      DUE_30: 0,
      EXPIRED: 0,
      OTHER: 0,
      UNKNOWN: 0,
    };

    // -----------------------------------------------------
    // MONTHLY AGGREGATION
    // -----------------------------------------------------
    const monthly: Record<
      string,
      { total: number; value: number }
    > = {};

    for (const c of companies) {
      const bucket = getRenewalBucket(c.renewal_date);
      buckets[bucket]++;

      if (c.renewal_date) {
        const d = new Date(c.renewal_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

        if (!monthly[key]) {
          monthly[key] = { total: 0, value: 0 };
        }

        monthly[key].total += 1;
        monthly[key].value += c.annual_price || 0;
      }
    }

    // -----------------------------------------------------
    // SORT MONTHLY KEYS (YYYY-MM ASC)
    // -----------------------------------------------------
    const sortedMonthly = Object.fromEntries(
      Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b))
    );

    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------
    return NextResponse.json({
      success: true,
      buckets,
      monthly: sortedMonthly,
      totalCompanies: companies.length,
    });

  } catch (err: any) {
    console.error("Renewals analytics API error:", err);
    return NextResponse.json(
      { success: false, message: "Unexpected server error" },
      { status: 500 }
    );
  }
}
