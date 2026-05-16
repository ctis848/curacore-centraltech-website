import { supabaseAdmin } from "@/lib/supabase/admin";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function AdminLicenseRequestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = supabaseAdmin;
  const requestId = params.id;

  const { data: request, error } = await supabase
    .from("LicenseRequest")
    .select(
      `
      id,
      userId,
      productName,
      requestedAt,
      status,
      notes,
      requestKey,
      companyName,
      userEmail
    `
    )
    .eq("id", requestId)
    .single();

  if (error || !request) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">License Request</h1>
        <p className="text-red-600 mt-2">Request not found.</p>
        <Link
          href="/admin/license-requests"
          className="mt-4 inline-block px-4 py-2 bg-gray-700 text-white rounded"
        >
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">License Request Detail</h1>

      {/* Request + User Info */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800 mb-2">
            Request Information
          </h2>

          <p className="text-xs text-slate-500 mb-1">
            Request ID: {request.id}
          </p>

          <p className="text-sm">
            <span className="font-medium">Product:</span>{" "}
            {request.productName}
          </p>

          <p className="text-sm mt-1">
            <span className="font-medium">Status:</span>{" "}
            <StatusBadge status={request.status} />
          </p>

          <p className="text-sm mt-1">
            <span className="font-medium">Requested:</span>{" "}
            {new Date(request.requestedAt).toLocaleString()}
          </p>

          {request.notes && (
            <p className="text-sm mt-2">
              <span className="font-medium">Notes:</span> {request.notes}
            </p>
          )}
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800 mb-2">
            Client Information
          </h2>

          <p className="text-sm">
            <span className="font-medium">Email:</span>{" "}
            {request.userEmail}
          </p>

          <p className="text-sm mt-1">
            <span className="font-medium">Company:</span>{" "}
            {request.companyName || "N/A"}
          </p>
        </div>
      </section>

      {/* Request Key */}
      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800 mb-2">
          License Request Key
        </h2>

        <textarea
          className="w-full p-3 border rounded text-xs font-mono"
          rows={6}
          readOnly
          value={request.requestKey}
        />
      </section>

      {/* Actions */}
      {request.status === "PENDING" && (
        <section className="flex gap-3">
          <form
            action={`/api/admin/license-requests/${request.id}/approve`}
            method="POST"
          >
            <button className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm">
              Approve & Send License
            </button>
          </form>

          <form
            action={`/api/admin/license-requests/${request.id}/reject`}
            method="POST"
          >
            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
              Reject Request
            </button>
          </form>
        </section>
      )}

      <Link
        href="/admin/license-requests"
        className="inline-block px-4 py-2 bg-gray-700 text-white rounded"
      >
        Back
      </Link>
    </div>
  );
}
