// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://s-redrose-1.onrender.com";
const FRONTEND_URL = process.env.NEXT_PUBLIC_APP_URL || "https://red-rose-seven.vercel.app";

const PROTECTED_ROUTES = ["/cart", "/checkout", "/orders", "/profile"];
const ADMIN_ROUTES = ["/admin"];
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

// Session cache (Edge runtime এ per-request)
async function checkSession(request: NextRequest): Promise<boolean> {
  try {
    // সব cookie forward করো backend এ
    const cookieHeader = request.headers.get("cookie") || "";
    if (!cookieHeader) return false;

    const res = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
      method: "GET",
      headers: {
        "Cookie": cookieHeader,
        "Content-Type": "application/json",
        "Origin": FRONTEND_URL,
      },
      // Edge runtime এ cache avoid করো
      cache: "no-store",
    });

    if (!res.ok) return false;
    const data = await res.json();
    return !!data?.user;
  } catch {
    // Backend unreachable হলে cookie থেকে guess করো
    const cookieHeader = request.headers.get("cookie") || "";
    return (
      cookieHeader.includes("session_token") ||
      cookieHeader.includes("better-auth")
    );
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ── Security Headers ─────────────────────────────────────────
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      `img-src 'self' data: blob: ${BACKEND_URL} https://lh3.googleusercontent.com`,
      `connect-src 'self' ${BACKEND_URL} https://accounts.google.com https://lh3.googleusercontent.com`,
    ].join("; "),
  );

  // ── Route guards ─────────────────────────────────────────────
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAdmin = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  if (isProtected || isAdmin || isAuthRoute) {
    const isLoggedIn = await checkSession(request);

    if ((isProtected || isAdmin) && !isLoggedIn) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAuthRoute && isLoggedIn) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|uploads|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
