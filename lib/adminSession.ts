// FILE: lib/adminSession.ts
import crypto from "crypto";

const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET!;

export function signAdminSession(payload: object) {
  const data = JSON.stringify(payload);

  const signature = crypto
    .createHmac("sha256", ADMIN_SESSION_SECRET)
    .update(data)
    .digest("hex");

  return `${data}.${signature}`;
}

export function verifyAdminSession(cookieValue: string) {
  const [data, signature] = cookieValue.split(".");
  if (!data || !signature) return null;

  const expected = crypto
    .createHmac("sha256", ADMIN_SESSION_SECRET)
    .update(data)
    .digest("hex");

  if (expected !== signature) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}
