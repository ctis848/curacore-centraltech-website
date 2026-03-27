import { db } from "@/lib/db";

export async function GET() {
  const requests = await db.apiLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return Response.json(
    requests.map((req) => ({
      id: req.id,
      endpoint: req.endpoint,
      statusCode: req.statusCode,
      createdAt: req.createdAt,
    }))
  );
}
