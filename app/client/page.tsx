// app/client/page.tsx
"use client";

import { useRouter } from "next/navigation";

const cards = [
  { title: "Send License Request Key", href: "/client/license-request" },
  { title: "Active Licenses", href: "/client/active-licenses" },
  { title: "Machine History", href: "/client/machine-history" },
  { title: "Payment History", href: "/client/payment-history" },
  { title: "Invoice History", href: "/client/invoice-history" },
  { title: "Annual 20% History", href: "/client/annual-history" },
  { title: "Renew Annual Payment", href: "/client/renew-annual" },
  { title: "Transfer License", href: "/client/transfer-license" },
  { title: "Contact Support", href: "/client/support" },
];

export default function ClientDashboardPage() {
  const router = useRouter();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Client Dashboard</h1>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.href}
            onClick={() => router.push(card.href)}
            className="bg-white rounded shadow p-4 text-left hover:shadow-md transition border border-slate-200"
          >
            <h2 className="text-lg font-semibold mb-2">{card.title}</h2>
            <p className="text-sm text-slate-500">
              Click to open {card.title.toLowerCase()}.
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
