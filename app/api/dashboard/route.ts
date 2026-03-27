import { db } from "@/lib/db";

export async function GET() {
  const [
    usersCount,
    licensesCount,
    requestsCount,
    licenses,
    logs
  ] = await Promise.all([
    db.user.count(),
    db.license.count(),
    db.licenseRequest.count(),
    db.license.findMany({ orderBy: { createdAt: "asc" } }),
    db.auditLog.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return Response.json({
    usersCount,
    licensesCount,
    requestsCount,
    licenses,
    logs
  });
}
