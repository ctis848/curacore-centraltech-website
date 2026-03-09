// components/Navbar.tsx – Server Component
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import NavbarClient from './NavbarClient';

export default async function Navbar() {
  // Get cookie store (server-side only)
  const cookieStore = await cookies();

  // Create Supabase server client WITHOUT modifying cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value ?? null;
        },
        // REMOVE set/remove — not allowed in Server Components
        set() {},
        remove() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <NavbarClient user={user} />;
}
