import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const YEAR_IN_MS = 365 * 24 * 60 * 60 * 1000;

async function run() {
  const now = new Date();

  // Only active licenses are relevant for annual fee checks
  const licenses = await prisma.license.findMany({
    where: { status: "ACTIVE" },
  });

  for (const lic of licenses) {
    // Use purchasedAt as the base date for annual fee due
    const lastPaid = lic.purchasedAt;

    if (!lastPaid) {
      // No purchase date — cannot determine due date, skip
      continue;
    }

    const nextDue = new Date(lastPaid.getTime() + YEAR_IN_MS);

    if (now > nextDue) {
      // Deactivate license
      await prisma.license.update({
        where: { id: lic.id },
        data: { status: "DEACTIVATED" },
      });

      // Record history
      await prisma.licenseHistory.create({
        data: {
          id: randomUUID(),
          licenseId: lic.id,
          action: "AUTO_DEACTIVATED",
          details: "Annual fee unpaid",
        },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          id: randomUUID(),
          type: "LICENSE_AUTO_DEACTIVATED",
          message: `License ${lic.id} auto-deactivated (annual fee unpaid)`,
        },
      });
    }
  }

  console.log("Annual fee check completed");
}

run()
  .catch((err) => {
    console.error("Annual fee check failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
