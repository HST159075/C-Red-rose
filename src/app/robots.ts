// src/app/robots.ts

import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://red-rose-seven.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/products"],
        disallow: ["/admin", "/profile", "/orders", "/cart", "/checkout", "/api"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
