// lib/supabase/server.ts
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';

export function createSupabaseServerClient() {
  // In Next.js 14+ (including 16), cookies() returns a Promise in server contexts
  // → we MUST await it to get the actual cookie store object
  const cookieStorePromise = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // get can be sync because it's only reading
        get(name: string) {
          // But to be safe, we await the store in the first read
          return cookieStorePromise.then(store => store.get(name)?.value ?? null);
        },

        // set & remove must be async because they write cookies
        async set(name: string, value: string, options: CookieOptions) {
          const cookieStore = await cookieStorePromise;
          cookieStore.set({ name, value, ...options });
        },

        async remove(name: string, options: CookieOptions) {
          const cookieStore = await cookieStorePromise;
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}