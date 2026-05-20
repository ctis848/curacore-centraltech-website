import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = supabaseServer();

    const [
      licensesRes,
      invoicesRes,
      requestsRes,
      ticketsRes
    ] = await Promise.all([
      supabase.from("License").select("*"),
      supabase.from("invoices").select("*"),
      supabase.from("LicenseRequest").select("*"),   // FIXED
      supabase.from("support_tickets").select("*"),
    ]);

    const licenses = licensesRes.data || [];
    const invoices = invoicesRes.data || [];
    const requests = requestsRes.data || [];
    const tickets = ticketsRes.data || [];

    const activeLicenses = licenses.filter(l => l.status === "ACTIVE").length;
    const inactiveLicenses = licenses.filter(l => l.status !== "ACTIVE").length;

    const annualFeeExpired = licenses.filter(l => {
      if (!l.annualFeePaidUntil) return true;
      return new Date(l.annualFeePaidUntil) < new Date();
    }).length;

    const totalPayments = invoices.length;
    const plansPurchased = invoices.filter(i => i.status === "PAID").length;

    const pendingRequests = requests.filter(r => r.status === "PENDING").length;
    const openTickets = tickets.filter(t => t.status === "OPEN").length;

    const annualFeeDueSoon = licenses.filter(l => {
      if (!l.annualFeePaidUntil) return false;
      const due = new Date(l.annualFeePaidUntil);
      const now = new Date();
      const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 30;
    }).length;

    return Response.json({
      success: true,
      activeLicenses,
      inactiveLicenses,
      annualFeeExpired,
      totalPayments,
      plansPurchased,
      pendingRequests,
      openTickets,
      annualFeeDueSoon,
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);

    return Response.json(
      { success: false, error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
