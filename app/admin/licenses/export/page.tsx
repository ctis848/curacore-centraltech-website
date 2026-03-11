"use client";

export default function ExportLicensesPage() {
  async function exportData() {
    const res = await fetch("/api/admin/licenses/export");
    const data = await res.json();

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "licenses.json";
    a.click();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Export Licenses</h1>

      <button
        onClick={exportData}
        className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
      >
        Download JSON
      </button>
    </div>
  );
}
