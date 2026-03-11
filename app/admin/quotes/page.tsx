export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from '@/lib/db';
import { getUserAndRole } from "@/lib/auth/getUserAndRole";
import { redirect } from "next/navigation";

export default async function AdminQuotesPage() {
  const { user, role } = await getUserAndRole();
  if (!user || role !== "admin") redirect("/login");

  const quotes = await db.quoteRequest.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-black text-teal-900 dark:text-white mb-6">
        Quote Requests
      </h1>

      {quotes.length === 0 && (
        <p className="text-gray-500 dark:text-gray-300 text-center">No quote requests yet.</p>
      )}

      <div className="space-y-6">
        {quotes.map((q: any) => (
          <div key={q.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700">
            <p className="font-bold text-teal-900 dark:text-white">{q.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{q.email}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{q.organization}</p>

            <p className="mt-3 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {q.details}
            </p>

            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              {new Date(q.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
