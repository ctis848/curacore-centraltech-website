import crypto from "crypto";

const RESET_TOKEN_SECRET =
  process.env.RESET_TOKEN_SECRET || "change-this-secret-in-production";

export function hashResetToken(rawToken: string) {
  return crypto
    .createHmac("sha256", RESET_TOKEN_SECRET)
    .update(rawToken)
    .digest("hex");
}
