import { db } from '@/lib/db';
import { getUserAndRole } from '@/lib/auth/getUserAndRole';
import { redirect } from 'next/navigation';
import type { EmailLog } from '@prisma/client';

export default async function EmailLogsPage() {
  const { user, role } = await getUserAndRole();

  // Protect route: only admins
  if (!user || role !== 'admin') {
    redirect('/login');
  }

  // Fetch logs — Prisma returns EmailLog[]
  const logs: EmailLog[] = await db.emailLog.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8">
        Email Logs
      </h1>

      {logs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center text-gray-600 dark:text-gray-300">
          No email logs found yet.
        </div>
      ) : (
        <div className="space-y-5">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {log.subject}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    To: {log.to}
                  </p>
                </div>
                <time className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </time>
              </div>

              {log.status && (
                <p className="text-sm mt-2">
                  Status:{' '}
                  <span
                    className={`font-medium ${
                      log.status === 'sent'
                        ? 'text-green-600 dark:text-green-400'
                        : log.status === 'failed'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {log.status}
                  </span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}