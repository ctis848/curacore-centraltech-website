// FILE: lib/auth.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getCurrentUser(token: string | null) {
  if (!token) return null;

  const session = await prisma.session.findFirst({
    where: { token },
    include: { user: true },
  });

  return session?.user || null;
}
