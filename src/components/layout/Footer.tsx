// src/components/layout/Footer.tsx

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-rose-950 text-white mt-16">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌹</span>
              <div>
                <h3 className="font-display font-bold text-lg">Red Rose</h3>
                <p className="text-rose-300 text-xs tracking-widest">COSMETIC SHOP</p>
              </div>
            </div>
            <p className="text-rose-200 text-sm leading-relaxed">
              Premium cosmetics & beauty products delivered to your door. Quality you can trust, beauty you will love.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-rose-100 mb-4 uppercase tracking-wider text-xs">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/products", label: "All Products" },
                { href: "/cart", label: "Cart" },
                { href: "/orders", label: "My Orders" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-rose-300 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-rose-100 mb-4 uppercase tracking-wider text-xs">Contact</h4>
            <ul className="space-y-2 text-rose-300 text-sm">
              <li>📍 RED ROSE, ShopNo: 118, Gazi Towar, Chwdirihat, Hathazari,Chittagong, Bangladesh</li>
              <li>📞 01887238025</li>
              <li>✉️ hsttasin90@gmail.com</li>
              <li className="pt-2">💵 Cash on Delivery available</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-rose-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-rose-400 text-sm">© {new Date().getFullYear()} Red Rose Cosmetic Shop. All rights reserved.</p>
          <p className="text-rose-500 text-xs">Only Premium Quality and Branding product.</p>
        </div>
      </div>
    </footer>
  );
}
