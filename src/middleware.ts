// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/cart", "/checkout", "/orders", "/profile"];
const ADMIN_ROUTES = ["/admin"];
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ── Security Headers ────────────────────────────────────────
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://s-redrose-1.onrender.com https://lh3.googleusercontent.com",
      "connect-src 'self' https://s-redrose-1.onrender.com https://lh3.googleusercontent.com https://accounts.google.com",
    ].join("; "),
  );

  // ── Session check ─────────────────────────────────────────────
  // Production এ __Secure- prefix হয়, তাই সব possible names check করো
  const allCookies = request.cookies.getAll();
  const isLoggedIn = allCookies.some(
    (c) =>
      c.name === "better-auth.session_token" ||
      c.name === "__Secure-better-auth.session_token" ||
      c.name.includes("session_token"),
  );

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAdmin = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  if (isAdmin && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
