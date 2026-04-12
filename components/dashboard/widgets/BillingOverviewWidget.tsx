"use client";

interface BillingOverviewWidgetProps {
  data: any; // Accept billing data from the dashboard
}

export default function BillingOverviewWidget({ data }: BillingOverviewWidgetProps) {
  return (
    <div className="p-6 bg-white border rounded-lg shadow space-y-4">
      <h2 className="text-xl font-semibold">Billing Overview</h2>

      <div className="space-y-2 text-sm">
        <p>
          <strong>Current Plan:</strong> {data?.currentPlan ?? "N/A"}
        </p>
        <p>
          <strong>Next Invoice:</strong>{" "}
          {data?.nextInvoiceAmount ?? "$0.00"} on {data?.nextInvoiceDate ?? "N/A"}
        </p>
        <p>
          <strong>Payment Method:</strong> {data?.paymentMethod ?? "N/A"}
        </p>
      </div>

      <button className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm">
        Manage Billing
      </button>
    </div>
  );
}
