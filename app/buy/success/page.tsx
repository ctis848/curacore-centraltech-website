import { createClient } from "@supabase/supabase-js";

export default async function SuccessPage({ searchParams }: any) {
  const reference = searchParams.ref;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("reference", reference)
    .single();

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center px-6 py-20">
      <div className="max-w-2xl bg-white shadow-2xl rounded-3xl p-10 border border-teal-100 text-center animate-fadeIn">
        <h1 className="text-4xl font-black text-teal-900 mb-4">Payment Successful</h1>
        <p className="text-lg text-gray-700 mb-6">
          Thank you for purchasing CentralCore EMR.
        </p>

        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 text-left mb-8">
          <p><strong>Reference:</strong> {reference}</p>
          {subscription && (
            <>
              <p><strong>Plan:</strong> {subscription.plan}</p>
              <p><strong>Seats:</strong> {subscription.quantity}</p>
              <p><strong>Amount:</strong> ₦{subscription.amount.toLocaleString()}</p>
              <p><strong>Date:</strong> {new Date(subscription.paid_at).toLocaleString()}</p>
            </>
          )}
        </div>

        <p className="text-gray-700 mb-6">
          A secure login link has been sent to your email. Click it to access your dashboard.
        </p>

        <a
          href="/dashboard"
          className="bg-teal-700 text-white px-10 py-4 rounded-full text-xl font-bold hover:bg-teal-800 transition"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
