import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import QueryProvider from "@/components/layout/QueryProvider";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://red-rose-seven.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Red Rose Cosmetic Shop 🌹",
    template: "%s | Red Rose Cosmetic Shop",
  },
  description:
    "Premium cosmetics, skincare & beauty products. Shop online with Cash on Delivery across Bangladesh.",
  keywords: [
    "cosmetics", "skincare", "beauty", "makeup",
    "Bangladesh", "online shop", "cash on delivery", "red rose",
  ],
  authors: [{ name: "Red Rose Cosmetic Shop" }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_BD",
    url: BASE_URL,
    siteName: "Red Rose Cosmetic Shop",
    title: "Red Rose Cosmetic Shop 🌹",
    description: "Premium cosmetics, skincare & beauty products with Cash on Delivery.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Red Rose Cosmetic Shop" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Red Rose Cosmetic Shop 🌹",
    description: "Premium cosmetics & beauty products with Cash on Delivery.",
    images: ["/og-image.jpg"],
  },
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#be123c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster position="top-right" richColors closeButton />
        </QueryProvider>
      </body>
    </html>
  );
}
