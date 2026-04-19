import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for Admin actions and authenticated server logic.
 * Uses the service role key for full DB access (RLS bypass).
 */
export function supabaseServer() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role for admin operations
    {
      cookies: {
        async get(name: string) {
          const store = await cookies();
          return store.get(name)?.value;
        },
        async set(name: string, value: string, options: any) {
          const store = await cookies();
          store.set(name, value, options);
        },
        async remove(name: string) {
          const store = await cookies();
          store.delete(name);
        },
      },
    }
  );
}
