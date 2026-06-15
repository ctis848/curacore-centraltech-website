import { z } from "zod";

export const LicenseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  auto_renew: z.boolean(),
  renewal_due_date: z.string(),
  service_fee_paid: z.boolean(),
  active: z.boolean(),
  annual_price: z.number(),
  portal_password: z.string().nullable(),
  company: z
    .object({
      name: z.string(),
      email: z.string().email(),
    })
    .nullable(),
});

export type LicenseType = z.infer<typeof LicenseSchema>;
