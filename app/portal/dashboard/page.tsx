// app/portal/dashboard/page.tsx (snippet - replace billing section)
<section className="bg-white rounded-3xl p-8 shadow-2xl border border-teal-100">
  <h2 className="text-3xl font-black text-teal-900 mb-8">Billing & Invoices</h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
    <div className="bg-teal-50 p-6 rounded-2xl text-center">
      <h3 className="text-xl font-bold text-teal-900 mb-2">Current Plan</h3>
      <p className="text-2xl font-black text-yellow-600">Starter</p>
    </div>
    <div className="bg-teal-50 p-6 rounded-2xl text-center">
      <h3 className="text-xl font-bold text-teal-900 mb-2">Next Billing</h3>
      <p className="text-2xl font-black text-yellow-600">Jan 1, 2026</p>
    </div>
    <div className="bg-teal-50 p-6 rounded-2xl text-center">
      <h3 className="text-xl font-bold text-teal-900 mb-2">Payment Method</h3>
      <p className="text-2xl font-black text-yellow-600">Paystack • ****4242</p>
    </div>
  </div>

  <h3 className="text-2xl font-bold text-teal-900 mb-6">Invoice History</h3>
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-teal-100">
          <th className="p-4">Invoice ID</th>
          <th className="p-4">Date</th>
          <th className="p-4">Amount</th>
          <th className="p-4">Status</th>
          <th className="p-4">Receipt</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b">
          <td className="p-4">inv001</td>
          <td className="p-4">2025-01-01</td>
          <td className="p-4">₦15,000</td>
          <td className="p-4 text-green-600">Paid</td>
          <td className="p-4"><Link href="#" className="text-teal-600 hover:underline">Download PDF →</Link></td>
        </tr>
        {/* Add more rows dynamically later */}
      </tbody>
    </table>
  </div>

  <div className="mt-12 text-center">
    <button className="bg-yellow-400 text-teal-900 px-12 py-6 rounded-full text-2xl font-bold hover:bg-yellow-300 transition shadow-2xl">
      Manage Billing in Paystack Portal
    </button>
  </div>
</section>