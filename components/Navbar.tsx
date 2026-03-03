import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const cookieStore = await cookies(); // FIX: await required

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {}
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {}
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="w-full flex items-center justify-between py-4 px-6 bg-white shadow">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-bold text-xl text-teal-700">
          CentralCore
        </Link>

        <Link href="/features">Features</Link>
        <Link href="/services">Services</Link>
        <Link href="/resources">Resources</Link>
        <Link href="/download">Download</Link>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/pricing"
          className="bg-yellow-400 px-4 py-2 rounded-md font-semibold"
        >
          Buy Now
        </Link>

        {user ? (
          <LogoutButton />
        ) : (
          <>
            <Link href="/auth/login" className="text-teal-700 font-semibold">
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="bg-teal-600 text-white px-4 py-2 rounded-md font-semibold"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
