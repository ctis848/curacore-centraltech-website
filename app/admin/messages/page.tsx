export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export default async function AdminMessagesPage({ searchParams }: any) {
  const page = Number(searchParams.page) || 1;
  const limit = 10;

  const search = searchParams.search || "";

  const where: Prisma.ContactMessageWhereInput | undefined = search
    ? {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
        ],
      }
    : undefined;

  const messages = await db.contactMessage.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const total = await db.contactMessage.count({ where });
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-teal-900 dark:text-white">
        Contact Messages
      </h1>

      {/* Search Bar */}
      <form className="mb-6">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search by name or email..."
          className="w-full p-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-teal-600"
        />
      </form>

      {messages.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-300">
          No messages found.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="border border-gray-200 dark:border-gray-700 p-4 sm:p-5 rounded-xl shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
                    {msg.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 break-all">
                    {msg.email}
                  </p>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap sm:text-right">
                  {new Date(msg.createdAt).toLocaleString()}
                </p>
              </div>

              <p className="text-gray-700 dark:text-gray-200 mt-2 whitespace-pre-wrap text-sm sm:text-base">
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-8">
        {page > 1 ? (
          <a
            href={`?page=${page - 1}&search=${search}`}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm sm:text-base"
          >
            ← Previous
          </a>
        ) : (
          <div />
        )}

        {page < totalPages && (
          <a
            href={`?page=${page + 1}&search=${search}`}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm sm:text-base"
          >
            Next →
          </a>
        )}
      </div>
    </div>
  );
}
