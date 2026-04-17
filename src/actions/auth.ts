// src/actions/auth.ts
"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://s-redrose-1.onrender.com";
const FRONTEND_URL = process.env.NEXT_PUBLIC_APP_URL || "https://red-rose-seven.vercel.app";

// ── Server-side session get ────────────────────────────────────
export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    // Cookie string তৈরি করো
    const cookieHeader = allCookies
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    if (!cookieHeader) return null;

    const res = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
      method: "GET",
      headers: {
        "Cookie": cookieHeader,
        "Content-Type": "application/json",
        "Origin": FRONTEND_URL,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data?.user ?? null;
  } catch {
    return null;
  }
}

// ── Login action ──────────────────────────────────────────────
export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": FRONTEND_URL,
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      return { error: data.message || data.error?.message || "Login failed" };
    }

    // Set-Cookie forward করো
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      const cookieStore = await cookies();
      // Cookie parse করে set করো
      const cookieParts = setCookie.split(",");
      for (const part of cookieParts) {
        const [nameValue, ...attrs] = part.trim().split(";");
        const [name, value] = (nameValue || "").split("=");
        if (name && value) {
          cookieStore.set(name.trim(), value.trim(), {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
          });
        }
      }
    }

    return { success: true, user: data.user };
  } catch {
    return { error: "Connection failed. Please try again." };
  }
}

// ── Logout action ─────────────────────────────────────────────
export async function logoutAction() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const cookieHeader = allCookies.map((c) => `${c.name}=${c.value}`).join("; ");

  try {
    await fetch(`${BACKEND_URL}/api/auth/sign-out`, {
      method: "POST",
      headers: {
        "Cookie": cookieHeader,
        "Origin": FRONTEND_URL,
      },
    });
  } catch { /* ignore */ }

  // Clear all auth cookies
  const authCookieNames = allCookies
    .filter((c) => c.name.includes("session") || c.name.includes("better-auth"))
    .map((c) => c.name);

  for (const name of authCookieNames) {
    cookieStore.delete(name);
  }

  redirect("/");
}
