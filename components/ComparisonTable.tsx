export default function ComparisonTable() {
  return (
    <section className="py-24 px-6 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-5xl font-black text-teal-900 text-center mb-16">
          Why CentralCore + CloudBeds?
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-3xl shadow-xl border border-gray-200">
            <thead>
              <tr className="bg-teal-800 text-white text-xl">
                <th className="p-6 text-left">Feature</th>
                <th className="p-6 text-left">CentralCore + CloudBeds</th>
                <th className="p-6 text-left">Traditional Systems</th>
              </tr>
            </thead>

            <tbody className="text-lg">
              <tr className="border-b">
                <td className="p-6">Unified Healthcare + Hospitality</td>
                <td className="p-6 font-bold text-teal-700">Yes</td>
                <td className="p-6 text-gray-500">No</td>
              </tr>

              <tr className="border-b">
                <td className="p-6">CloudBeds PMS Integration</td>
                <td className="p-6 font-bold text-teal-700">Yes</td>
                <td className="p-6 text-gray-500">No</td>
              </tr>

              <tr className="border-b">
                <td className="p-6">Real‑time Sync</td>
                <td className="p-6 font-bold text-teal-700">Instant</td>
                <td className="p-6 text-gray-500">Delayed</td>
              </tr>

              <tr className="border-b">
                <td className="p-6">Guest + Patient Profiles</td>
                <td className="p-6 font-bold text-teal-700">Unified</td>
                <td className="p-6 text-gray-500">Separate</td>
              </tr>

              <tr>
                <td className="p-6">Automation & AI</td>
                <td className="p-6 font-bold text-teal-700">Advanced</td>
                <td className="p-6 text-gray-500">Basic</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
