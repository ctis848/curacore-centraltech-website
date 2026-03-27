import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function logAdminAction(params: {
  adminId: string;
  action: string;
  targetId?: string;
  details?: string;
}) {
  const { adminId, action, targetId, details } = params;
  await prisma.auditLog.create({
    data: { adminId, action, targetId, details },
  });
}
