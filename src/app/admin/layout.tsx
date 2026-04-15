"use client";
// src/app/admin/layout.tsx

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Tag, ShoppingBag, Users } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/admin/products", label: "Products", icon: <Package size={18} /> },
  { href: "/admin/categories", label: "Categories", icon: <Tag size={18} /> },
  { href: "/admin/orders", label: "Orders", icon: <ShoppingBag size={18} /> },
  { href: "/admin/users", label: "Users", icon: <Users size={18} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && (!session?.user || session.user.role !== "ADMIN")) {
      router.push("/");
    }
  }, [session, isPending]);

  if (isPending || !session?.user || session.user.role !== "ADMIN") return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-rose-950 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-5 border-b border-rose-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌹</span>
            <div>
              <p className="font-display font-bold text-sm">Red Rose</p>
              <p className="text-rose-400 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="p-3 flex-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-colors ${active ? "bg-rose-700 text-white" : "text-rose-200 hover:bg-rose-800 hover:text-white"}`}>
                {item.icon} {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-rose-800">
          <Link href="/" className="text-rose-400 hover:text-white text-xs transition-colors">
            ← Back to Shop
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Mobile nav */}
        <div className="md:hidden bg-rose-950 text-white p-4 flex gap-2 overflow-x-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${pathname === item.href ? "bg-rose-600 text-white" : "text-rose-300 hover:bg-rose-800"}`}>
              {item.icon} {item.label}
            </Link>
          ))}
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
