"use client";

export default function BillingOverviewWidget() {
  return (
    <div className="p-6 bg-white border rounded-lg shadow space-y-4">
      <h2 className="text-xl font-semibold">Billing Overview</h2>

      <div className="space-y-2 text-sm">
        <p><strong>Current Plan:</strong> Pro</p>
        <p><strong>Next Invoice:</strong> $49.00 on April 1</p>
        <p><strong>Payment Method:</strong> Visa •••• 4242</p>
      </div>

      <button className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm">
        Manage Billing
      </button>
    </div>
  );
}
