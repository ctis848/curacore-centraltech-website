"use server";

import { db } from "@/lib/db";

export async function bindMachine(machineId: string, licenseId: string) {
  await db.machineActivation.upsert({
    where: {
      licenseId_machineId: {
        licenseId,
        machineId,
      },
    },
    update: {
      lastSeenAt: new Date(),
    },
    create: {
      licenseId,
      machineId,
      activatedAt: new Date(),
      lastSeenAt: new Date(),
    },
  });
}
