// /app/dashboard/analytics/page.tsx
import { getUserAndRole } from "@/lib/auth/getUserAndRole";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage() {
  const { role } = await getUserAndRole();

  if (role !== "admin") {
    return (
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-teal-900 mb-6">Analytics</h1>
        <p className="p-4 bg-red-100 text-red-700 rounded-xl">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return <AnalyticsClient />;
}
