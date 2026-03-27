import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  const now = new Date();

  const licenses = await prisma.license.findMany({
    where: { status: "ACTIVE" },
  });

  for (const lic of licenses) {
    const lastPaid = lic.lastAnnualFeePaidAt ?? lic.purchasedAt;

    if (!lastPaid) {
      // No payment or purchase date — skip this license
      continue;
    }

    const nextDue = new Date(lastPaid.getTime() + 365 * 24 * 60 * 60 * 1000);

    if (now > nextDue) {
      await prisma.license.update({
        where: { id: lic.id },
        data: { status: "DEACTIVATED" },
      });

      await prisma.licenseHistory.create({
        data: {
          id: crypto.randomUUID(),
          licenseId: lic.id,
          action: "AUTO_DEACTIVATED",
          details: "Annual fee unpaid",
        },
      });

      await prisma.notification.create({
        data: {
          id: crypto.randomUUID(),
          type: "LICENSE_AUTO_DEACTIVATED",
          message: `License ${lic.id} auto-deactivated (annual fee unpaid)`,
        },
      });
    }
  }

  console.log("Annual fee check completed");
}

run().finally(() => prisma.$disconnect());
