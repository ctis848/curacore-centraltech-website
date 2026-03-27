import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function renderTemplate(name: string, vars: Record<string, string>) {
  const tpl = await prisma.emailTemplate.findUnique({ where: { name } });
  if (!tpl) return null;

  let subject = tpl.subject;
  let body = tpl.body;

  for (const [key, value] of Object.entries(vars)) {
    const token = `{{${key}}}`;
    subject = subject.replaceAll(token, value);
    body = body.replaceAll(token, value);
  }

  return { subject, body };
}
