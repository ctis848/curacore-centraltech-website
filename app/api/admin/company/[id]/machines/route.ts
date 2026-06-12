import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface Company {
  id: string;
  name: string;
  license_count: number;
  renewal_date: string | null;
  annual_price: number;
  created_at: string;
}

interface Machine {
  id: string;
  device_id: string;
  active: boolean;
  created_at: string;
  last_seen: string | null;
  company_id: string;
}

interface ApiResponse {
  success: boolean;
  company?: Company;
  machines?: Machine[];
  message?: string;
  error?: unknown;
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;

    // Fetch company
    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .select(
        "id, name, license_count, renewal_date, annual_price, created_at"
      )
      .eq("id", companyId)
      .single();

    if (companyError || !company) {
      const response: ApiResponse = {
        success: false,
        message: "Company not found",
        error: companyError,
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Fetch machines
    const { data: machines, error: machinesError } = await supabaseAdmin
      .from("machines")
      .select(
        "id, device_id, active, created_at, last_seen, company_id"
      )
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (machinesError) {
      const response: ApiResponse = {
        success: false,
        message: "Failed to load machines",
        error: machinesError,
      };
      return NextResponse.json(response, { status: 500 });
    }

    const response: ApiResponse = {
      success: true,
      company,
      machines: machines || [],
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    const response: ApiResponse = {
      success: false,
      message: "Server error",
      error: err,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
