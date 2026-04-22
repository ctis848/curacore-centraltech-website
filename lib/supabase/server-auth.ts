import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase server client for AUTH actions (login/logout/session).
 * Uses the anon key so it can read/write user session cookies.
 */
export function supabaseAuthServer() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
