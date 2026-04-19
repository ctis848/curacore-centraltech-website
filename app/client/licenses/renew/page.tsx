"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function RenewLicensesPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const RENEWAL_RATE = 0.20; // 20%

  useEffect(() => {
    loadLicenses();
  }, []);

  const loadLicenses = async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/client/login");
      return;
    }

    const { data, error } = await supabase
      .from("License")
      .select("*")
      .eq("userId", user.id)
      .eq("status", "ACTIVE");

    if (error) {
      setError("Failed to load licenses.");
      setLoading(false);
      return;
    }

    setLicenses(data || []);
    setLoading(false);
  };

  const totalRenewalCost = licenses.reduce(
    (sum, lic) => sum + lic.price * RENEWAL_RATE,
    0
  );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">
        Renew Active Licenses
      </h1>

      <p className="text-sm text-slate-600">
        Renew all your active licenses for 20% of their annual value.
      </p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading licenses…</p>
      ) : licenses.length === 0 ? (
        <p className="text-slate-600">You have no active licenses to renew.</p>
      ) : (
        <>
          <div className="rounded border p-4 bg-slate-50">
            <h2 className="font-semibold mb-2">Active Licenses</h2>
            <ul className="space-y-1">
              {licenses.map((lic) => (
                <li key={lic.id} className="text-sm">
                  {lic.productName} — ₦{lic.price.toLocaleString()}  
                  <span className="text-slate-500">
                    {" "}
                    (Renewal: ₦{(lic.price * RENEWAL_RATE).toLocaleString()})
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded border p-4 bg-green-50">
            <h2 className="font-semibold mb-2">Total Renewal Cost</h2>
            <p className="text-lg font-bold text-green-700">
              ₦{totalRenewalCost.toLocaleString()}
            </p>
          </div>

          <button
            onClick={() =>
              router.push(
                `/client/licenses/renew/pay?amount=${totalRenewalCost}`
              )
            }
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Proceed to Payment
          </button>
        </>
      )}
    </div>
  );
}
