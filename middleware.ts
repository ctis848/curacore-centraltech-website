import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiter (for production use Redis/KV)
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 20; // max requests per minute
const ipHits = new Map<string, { count: number; ts: number }>();

export function middleware(req: NextRequest) {
  const token = req.cookies.get("sb-access-token")?.value;
  const { pathname } = req.nextUrl;

  // Public routes
  const publicPaths = [
    "/",
    "/login",
    "/signup",
    "/auth/login",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email",
    "/pricing",
    "/contact",
    "/features",
    "/services",
    "/resources",
    "/download",
    "/buy",
  ];

  // ⭐ Rate limit auth endpoints
  const rateLimitedPaths = [
    "/auth/login",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
  ];

  if (rateLimitedPaths.some((p) => pathname.startsWith(p))) {
    // FIX: NextRequest does NOT have req.ip
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const now = Date.now();
    const record = ipHits.get(ip) ?? { count: 0, ts: now };

    if (now - record.ts > RATE_LIMIT_WINDOW) {
      ipHits.set(ip, { count: 1, ts: now });
    } else {
      record.count += 1;
      ipHits.set(ip, record);

      if (record.count > RATE_LIMIT_MAX) {
        return new NextResponse("Too many requests. Try again later.", {
          status: 429,
        });
      }
    }
  }

  // Allow public pages
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // ⭐ Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );

    if (payload.email !== "your-email@domain.com") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  }

  // ⭐ Protect dashboard
  if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ⭐ Prevent logged-in users from accessing login/signup
  if (token && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/auth/:path*",
    "/login",
    "/signup",
  ],
};
