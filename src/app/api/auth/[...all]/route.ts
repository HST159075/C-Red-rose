// src/app/api/auth/[...all]/route.ts
// এই route frontend এ Better Auth এর সব /api/auth/* request handle করবে
// এটা backend এ proxy করবে - same domain এ cookie set হবে

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://s-redrose-1.onrender.com";

async function handler(req: NextRequest) {
  const url = req.nextUrl.pathname + (req.nextUrl.search || "");

  // Backend এ forward করো
  const backendUrl = `${BACKEND_URL}${url}`;

  const headers = new Headers();
  // Original headers forward করো (cookie সহ)
  req.headers.forEach((value, key) => {
    if (!["host", "connection"].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  headers.set("x-forwarded-host", req.headers.get("host") || "");
  headers.set("x-forwarded-proto", "https");

  let body: BodyInit | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.arrayBuffer();
  }

  try {
    const backendRes = await fetch(backendUrl, {
      method: req.method,
      headers,
      body,
      credentials: "include",
    });

    // Response headers forward করো (Set-Cookie সহ)
    const resHeaders = new Headers();
    backendRes.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        // Cookie থেকে SameSite=None এবং Secure remove করো
        // কারণ এখন same-origin (vercel → vercel api route → render)
        const modifiedCookie = value
          .replace(/; ?SameSite=None/gi, "; SameSite=Lax")
          .replace(/; ?Partitioned/gi, "");
        resHeaders.append("set-cookie", modifiedCookie);
      } else {
        resHeaders.set(key, value);
      }
    });

    const responseBody = await backendRes.arrayBuffer();

    return new NextResponse(responseBody, {
      status: backendRes.status,
      headers: resHeaders,
    });
  } catch (error) {
    console.error("Auth proxy error:", error);
    return NextResponse.json({ error: "Auth service unavailable" }, { status: 503 });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const OPTIONS = handler;
