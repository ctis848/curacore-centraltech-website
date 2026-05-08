export default function PaymentSuccess() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-emerald-700">Payment Successful</h1>
      <p className="mt-3">Your annual renewal has been updated.</p>
      <a href="/client/renew-annual" className="text-blue-600 underline mt-4 block">
        Return to Billing
      </a>
    </div>
  );
}
