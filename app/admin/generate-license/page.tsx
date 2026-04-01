export const dynamic = "force-dynamic";
export const revalidate = 0;

import { supabaseServer } from "@/lib/supabase/server";
import ApproveForm from "./ApproveForm";

type GenerateLicensePageProps = {
  searchParams?: {
    request?: string;
  };
};

export default async function GenerateLicensePage({ searchParams }: GenerateLicensePageProps) {
  const supabase = supabaseServer();
  const requestId =
    typeof searchParams?.request === "string" ? searchParams.request : undefined;

  if (!requestId) {
    return (
      <PageShell>
        <ErrorBox
          title="Missing Request ID"
          message="No license request was specified. Please return to the admin panel."
        />
      </PageShell>
    );
  }

  // Fetch request + client
  const { data: request, error } = await supabase
    .from("license_requests")
    .select(
      `
      id,
      request_key,
      product_name,
      notes,
      status,
      created_at,
      generated_license,
      clients:user_id (
        id,
        name,
        email
      )
    `
    )
    .eq("id", requestId)
    .maybeSingle();

  if (error || !request) {
    return (
      <PageShell>
        <ErrorBox
          title="Request Not Found"
          message="This license request does not exist or may have been removed."
        />
      </PageShell>
    );
  }

  // Supabase returns relational data as an array
  const client = Array.isArray(request.clients) ? request.clients[0] : null;

  const createdAt = request.created_at
    ? new Date(request.created_at).toLocaleString()
    : "Unknown";

  const statusClass = statusBadgeClass(request.status);

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-teal-700">Generate License</h1>
        <a
          href="/admin/license-requests"
          className="text-sm text-teal-700 hover:underline"
        >
          ← Back to Requests
        </a>
      </div>

      {/* Request Summary */}
      <div className="bg-white p-5 rounded-lg shadow space-y-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Request Details</h2>
          <span className="text-xs text-gray-500">Created: {createdAt}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoBlock label="Client Name" value={client?.name ?? "Unknown"} />
          <InfoBlock label="Client Email" value={client?.email ?? "Unknown"} />
          <InfoBlock label="Product" value={request.product_name ?? "N/A"} />

          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={statusClass}>{request.status.toUpperCase()}</span>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Request Key</p>
          <pre className="bg-gray-100 p-3 rounded text-sm border overflow-x-auto">
            {request.request_key}
          </pre>
        </div>

        {request.notes && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Notes</p>
            <p className="bg-gray-50 p-3 rounded text-sm border whitespace-pre-wrap">
              {request.notes}
            </p>
          </div>
        )}
      </div>

      {/* Already Approved */}
      {request.status !== "pending" && (
        <div className="bg-green-50 p-4 rounded border border-green-200 text-green-800 space-y-3">
          <p className="font-semibold">This request has already been approved.</p>

          {request.generated_license && (
            <div>
              <p className="text-sm text-gray-600">Generated License</p>
              <pre className="bg-gray-100 p-3 rounded text-sm border overflow-x-auto">
                {request.generated_license}
              </pre>
            </div>
          )}

          <a
            href="/admin/licenses"
            className="inline-block px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
          >
            View License in Admin Panel
          </a>
        </div>
      )}

      {/* Approve Form */}
      {request.status === "pending" && (
        <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold mb-3">Paste & Send License</h2>

          <p className="text-sm text-gray-600 mb-3">
            Paste the license generated from your external generator.  
            Once approved, it will:
          </p>

          <ul className="text-sm text-gray-600 list-disc ml-6 space-y-1">
            <li>Appear in the client’s Active Licenses</li>
            <li>Be added to License History</li>
            <li>Increase the client’s active license count</li>
            <li>Be available for machine activation</li>
            <li>Send a notification/email to the client</li>
          </ul>

          <ApproveForm requestId={request.id} />
        </div>
      )}
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="p-6 space-y-6 max-w-3xl mx-auto">{children}</div>;
}

function ErrorBox({ title, message }: { title: string; message: string }) {
  return (
    <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded space-y-1">
      <p className="font-semibold">{title}</p>
      <p className="text-sm">{message}</p>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  );
}

function statusBadgeClass(status: string) {
  const s = status.toLowerCase();
  const base =
    "inline-flex items-center px-2 py-1 rounded text-xs font-semibold border";

  switch (s) {
    case "pending":
      return `${base} bg-yellow-50 text-yellow-800 border-yellow-200`;
    case "approved":
      return `${base} bg-green-50 text-green-800 border-green-200`;
    case "rejected":
      return `${base} bg-red-50 text-red-800 border-red-200`;
    default:
      return `${base} bg-gray-50 text-gray-700 border-gray-200`;
  }
}
