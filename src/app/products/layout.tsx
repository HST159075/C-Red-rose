import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Browse our full collection of premium cosmetics, skincare, makeup, handbags & fragrances. Shop with Cash on Delivery.",
  openGraph: {
    title: "All Products | Red Rose Cosmetic Shop",
    description: "Browse premium cosmetics & beauty products.",
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
