"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function RenewLicensePage() {
  const router = useRouter();
  const supabase = createSupabaseClient();

  const [user, setUser] = useState<any>(null);
  const [license, setLicense] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/auth/login");
        return;
      }

      setUser(data.user);

      const licRes = await fetch("/api/license/get");
      const licData = await licRes.json();
      setLicense(licData);

      setLoading(false);
    }

    loadData();
  }, []);

  async function handleRenewal() {
    try {
      setProcessing(true);

      const res = await fetch("/api/create-paystack-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          amount: 5000, // Annual service fee
          plan: license.plan,
          user_id: user.id,
          fullName: user.email,
          renewal: true,
        }),
      });

      const data = await res.json();
      setProcessing(false);

      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert("Payment initialization failed.");
      }
    } catch (err) {
      console.error(err);
      setProcessing(false);
      alert("Error connecting to payment server.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 md:px-10 py-12 space-y-10">

      <div className="max-w-3xl mx-auto space-y-8">

        <h1 className="text-3xl sm:text-4xl font-bold text-teal-800 text-center">
          Renew Your License
        </h1>

        <p className="text-center text-gray-700 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Your annual service fee keeps your CentralCore EMR license active and ensures continuous updates and support.
        </p>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-teal-200 space-y-6">

          <h2 className="text-xl sm:text-2xl font-bold text-teal-800">
            License Details
          </h2>

          <div className="space-y-2 text-gray-700 text-sm sm:text-base">
            <p><strong>Plan:</strong> {license.plan.toUpperCase()}</p>
            <p><strong>Status:</strong> {license.is_active ? "Active" : "Expired"}</p>
            <p><strong>Expires:</strong> {new Date(license.expires_at).toLocaleDateString()}</p>
          </div>

          <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl text-center">
            <p className="text-teal-900 font-semibold text-lg">
              Annual Service Fee: ₦5,000
            </p>
          </div>

          <button
            onClick={handleRenewal}
            disabled={processing}
            className="w-full bg-teal-700 text-white py-3 rounded-xl font-semibold text-base sm:text-lg hover:bg-teal-800 transition"
          >
            {processing ? "Processing..." : "Renew License"}
          </button>
        </div>

        <p className="text-center text-gray-700 text-sm sm:text-base">
          Need help?{" "}
          <a href="/contact" className="text-teal-700 font-semibold hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
