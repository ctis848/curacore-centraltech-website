import { db } from "@/lib/db";

export async function GET() {
  const [users, licenses, requests] = await Promise.all([
    db.user.count(),
    db.license.count(),
    db.licenseRequest.count(),
  ]);

  return Response.json({
    users,
    licenses,
    requests,
    status: "Operational",
  });
}
