"use client";
// src/components/layout/Navbar.tsx

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Package,
  Settings,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useCartStore } from "@/store/cartStore";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const { fetchCart, itemCount } = useCartStore();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user) fetchCart();
  }, [session]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMobileOpen(false);
      setSearchOpen(false);
      setUserMenuOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileOpen(false);
        setUserMenuOpen(false);
      }
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 3D tilt on mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = headerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1200px) rotateX(${-y * 3}deg) rotateY(${x * 2}deg)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = headerRef.current;
    if (!el) return;
    el.style.transition = "transform 0.6s cubic-bezier(0.34,1.56,0.64,1)";
    el.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
    setTimeout(() => {
      if (el) el.style.transition = "";
    }, 600);
  }, []);

  const handleLogout = async () => {
    await authClient.signOut();
    setUserMenuOpen(false);
    toast.success("Logged out successfully");
    router.push("/");
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const cartCount = itemCount();
  const user = session?.user;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    // { href: "/products?category=skincare", label: "Skincare" },
    // { href: "/products?category=fragrances", label: "Perfium" },
    // { href: "/products?category=tools", label: "Tools" },
    // { href: "/products?category=makeup", label: "Makeup" },
    // { href: "/products?category=face-wash", label: "Face Wash" },
  ];

  return (
    <>
      <style>{`
        /* ── 3D floating navbar ── */
        .navbar-3d {
          transform-style: preserve-3d;
          will-change: transform;
          animation: navFloat 5s ease-in-out infinite;
        }
        @keyframes navFloat {
          0%, 100% { box-shadow: 0 2px 20px rgba(190,18,60,0.08); }
          50%       { box-shadow: 0 12px 40px rgba(190,18,60,0.15); }
        }

        /* top-edge highlight */
        .navbar-3d::before {
          content: '';
          position: absolute;
          top: 0; left: 5%; right: 5%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(254,205,211,0.8), transparent);
          pointer-events: none;
          z-index: 1;
        }

        /* ── Nav links ── */
        .nav-link { position: relative; transform-style: preserve-3d; }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 50%;
          width: 0; height: 2px;
          background: #be123c;
          border-radius: 2px;
          transition: width 0.25s cubic-bezier(0.4,0,0.2,1);
          transform: translateX(-50%);
        }
        .nav-link:hover::after, .nav-link.active::after { width: 80%; }
        .nav-link.active { color: #be123c !important; }
        .nav-link:hover {
          transform: translateY(-3px) rotateX(8deg) scale(1.05) !important;
          box-shadow: 0 8px 18px rgba(190,18,60,0.14);
          color: #be123c !important;
        }
        .nav-link:active { transform: translateY(0) scale(0.97) !important; }

        /* ── Icon buttons ── */
        .icon-btn {
          position: relative;
          transition: background 0.15s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
          transform-style: preserve-3d;
        }
        .icon-btn:hover {
          background: #fff1f2 !important;
          transform: translateY(-3px) rotateX(10deg) !important;
          box-shadow: 0 8px 16px rgba(190,18,60,0.14);
        }
        .icon-btn:active { transform: translateY(0) scale(0.93) !important; }

        /* ── Cart ── */
        .cart-btn { transition: transform 0.2s ease; }
        .cart-btn:hover { transform: translateY(-3px) rotateX(10deg) scale(1.05) !important; }
        .cart-btn:active { transform: scale(0.95) !important; }
        .cart-badge { animation: popIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        /* ── Logo icon 3D spin ── */
        .logo-icon-3d {
          display: inline-block;
          filter: drop-shadow(0 2px 4px rgba(190,18,60,0.2));
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
          transform-style: preserve-3d;
          animation: logoFloat 4s ease-in-out infinite;
        }
        @keyframes logoFloat {
          0%, 100% { transform: rotateY(0deg);   }
          50%       { transform: rotateY(14deg);  }
        }
        .logo-icon-3d:hover {
          transform: rotateY(25deg) scale(1.12) !important;
          animation-play-state: paused;
        }

        /* ── User avatar 3D ── */
        .user-avatar {
          transition: box-shadow 0.2s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
          transform-style: preserve-3d;
        }
        .user-avatar:hover {
          box-shadow: 0 0 0 3px #fecdd3, 0 10px 20px rgba(190,18,60,0.2);
          transform: translateY(-3px) rotateY(12deg) scale(1.06);
        }

        /* ── Sign-up shimmer ── */
        .signup-3d {
          position: relative;
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1) !important;
          transform-style: preserve-3d;
        }
        .signup-3d::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent);
          transition: left 0.4s ease;
        }
        .signup-3d:hover {
          transform: translateY(-3px) rotateX(8deg) !important;
          box-shadow: 0 10px 24px rgba(190,18,60,0.38) !important;
        }
        .signup-3d:hover::after { left: 100%; }

        /* ── Dropdown ── */
        .dropdown-menu {
          animation: dropIn 0.2s cubic-bezier(0.4,0,0.2,1);
          transform-origin: top right;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: scale(0.95) translateY(-8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        .dropdown-item {
          transition: background 0.15s ease, color 0.15s ease, padding-left 0.15s ease;
        }
        .dropdown-item:hover { padding-left: 20px !important; }

        /* ── Search bar ── */
        .search-bar { animation: slideDown 0.25s cubic-bezier(0.4,0,0.2,1); }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .search-input:focus { box-shadow: 0 0 0 3px #fecdd3 !important; }

        /* ── Mobile menu ── */
        .mobile-menu { animation: slideRight 0.3s cubic-bezier(0.4,0,0.2,1); }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-100%); }
          to   { opacity: 1; transform: translateX(0);      }
        }
        .mobile-link {
          position: relative;
          overflow: hidden;
          transition: all 0.2s ease;
        }
        .mobile-link::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 0;
          background: #be123c;
          border-radius: 0 4px 4px 0;
          transition: width 0.2s ease;
        }
        .mobile-link:hover::before, .mobile-link.active::before { width: 3px; }
        .mobile-link:hover { padding-left: 20px !important; }
        .mobile-link.active { background: #fff1f2; color: #be123c; font-weight: 600; }

        /* ── Misc ── */
        .logout-btn { transition: all 0.15s ease; }
        .logout-btn:hover { background: #fef2f2; color: #dc2626; padding-left: 20px !important; }

        /* ── Responsive ── */
        .hidden-mobile { display: flex; }
        .show-mobile   { display: none;  }
        @media (max-width: 767px) {
          .hidden-mobile { display: none  !important; }
          .show-mobile   { display: flex  !important; }
          .navbar-3d { animation: none; }
        }
      `}</style>

      <header
        ref={headerRef}
        className="navbar-3d"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "white",
          borderBottom: scrolled ? "none" : "1px solid #ffe4e6",
          boxShadow: scrolled ? "0 2px 20px rgba(190,18,60,0.08)" : "none",
          transition: "border-bottom 0.3s ease, background 0.3s ease",
        }}
      >
        <div className="page-container">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: 64,
            }}
          >
            {/* ── Logo ── */}
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              <span className="logo-icon-3d" style={{ fontSize: 26, lineHeight: 1 }}>
                🌹
              </span>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    color: "#9f1239",
                    fontSize: 18,
                    lineHeight: 1.1,
                  }}
                >
                  Red Rose
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: "#fb7185",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  Cosmetic Shop
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav
              style={{ display: "flex", alignItems: "center", gap: 4 }}
              className="hidden-mobile"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${pathname === link.href ? "active" : ""}`}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    color: pathname === link.href ? "#be123c" : "#4b5563",
                    textDecoration: "none",
                    transition:
                      "color 0.2s ease, background 0.2s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease",
                  }}
                >
                  {link.label}
                </Link>
              ))}

              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#be123c",
                    textDecoration: "none",
                    background: pathname.startsWith("/admin")
                      ? "#fff1f2"
                      : "transparent",
                    transition: "background 0.2s ease",
                  }}
                >
                  ⚙️ Admin
                </Link>
              )}
            </nav>

            {/* ── Actions ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="icon-btn"
                aria-label="Search (Ctrl+K)"
                title="Search (Ctrl+K)"
                style={{
                  padding: 8,
                  borderRadius: 8,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: searchOpen ? "#be123c" : "#6b7280",
                }}
              >
                <Search size={20} />
              </button>

              {/* Cart */}
              {user && (
                <Link
                  href="/cart"
                  className="cart-btn icon-btn"
                  aria-label={`Cart — ${cartCount} items`}
                  style={{
                    position: "relative",
                    padding: 8,
                    borderRadius: 8,
                    color: "#6b7280",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span
                      className="cart-badge"
                      style={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        background: "linear-gradient(135deg, #e11d48, #be123c)",
                        color: "white",
                        fontSize: 10,
                        fontWeight: 700,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid white",
                      }}
                    >
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* User Menu */}
              {user ? (
                <div
                  style={{ position: "relative" }}
                  ref={userMenuRef}
                  className="hidden-mobile"
                >
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 6px",
                      borderRadius: 10,
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      className="user-avatar"
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #fecdd3, #fda4af)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#9f1239",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown
                      size={13}
                      style={{
                        color: "#9ca3af",
                        transition: "transform 0.25s ease",
                        transform: userMenuOpen ? "rotate(180deg)" : "rotate(0)",
                      }}
                    />
                  </button>

                  {userMenuOpen && (
                    <div
                      className="dropdown-menu"
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 8px)",
                        width: 220,
                        background: "white",
                        borderRadius: 14,
                        border: "1px solid #ffe4e6",
                        boxShadow: "0 10px 40px rgba(190,18,60,0.12)",
                        overflow: "hidden",
                        zIndex: 100,
                      }}
                    >
                      {/* User info */}
                      <div
                        style={{
                          padding: "14px 16px",
                          background: "linear-gradient(135deg, #fff1f2, #ffe4e6)",
                          borderBottom: "1px solid #fecdd3",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #fda4af, #fb7185)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontWeight: 700,
                              fontSize: 14,
                            }}
                          >
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ overflow: "hidden" }}>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#1f2937",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {user.name}
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 11,
                                color: "#be123c",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Links */}
                      <div style={{ padding: "6px 0" }}>
                        {[
                          { href: "/profile",  label: "Profile",     icon: <User size={14} /> },
                          { href: "/orders",   label: "My Orders",   icon: <Package size={14} /> },
                          ...(user.role === "ADMIN"
                            ? [{ href: "/admin", label: "Admin Panel", icon: <Settings size={14} /> }]
                            : []),
                        ].map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="dropdown-item"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "9px 16px",
                              textDecoration: "none",
                              fontSize: 13,
                              color: "#374151",
                            }}
                          >
                            <span style={{ color: "#be123c" }}>{item.icon}</span>
                            {item.label}
                          </Link>
                        ))}
                      </div>

                      {/* Logout */}
                      <div style={{ borderTop: "1px solid #fff1f2", padding: "6px 0" }}>
                        <button
                          onClick={handleLogout}
                          className="logout-btn"
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "9px 16px",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontSize: 13,
                            color: "#ef4444",
                            textAlign: "left",
                          }}
                        >
                          <LogOut size={14} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }} className="hidden-mobile">
                  <Link
                    href="/auth/login"
                    style={{
                      padding: "7px 18px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#be123c",
                      border: "1.5px solid #fecdd3",
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "#fff1f2";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="signup-3d"
                    style={{
                      padding: "7px 18px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 500,
                      color: "white",
                      background: "#be123c",
                      textDecoration: "none",
                      display: "inline-block",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "#9f1239";
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 10px 24px rgba(190,18,60,0.38)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "#be123c";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="icon-btn show-mobile"
                aria-label="Menu"
                style={{
                  padding: 8,
                  borderRadius: 8,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                <div
                  style={{
                    transition: "transform 0.3s ease",
                    transform: mobileOpen ? "rotate(90deg)" : "rotate(0)",
                  }}
                >
                  {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </div>
              </button>
            </div>
          </div>

          {/* ── Search Bar ── */}
          {searchOpen && (
            <div className="search-bar" style={{ paddingBottom: 12 }}>
              <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <Search
                    size={16}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9ca3af",
                    }}
                  />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="search-input"
                    style={{
                      width: "100%",
                      paddingLeft: 38,
                      paddingRight: 12,
                      paddingTop: 10,
                      paddingBottom: 10,
                      borderRadius: 10,
                      border: "1.5px solid #fecdd3",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "box-shadow 0.2s ease",
                    }}
                    autoComplete="off"
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    background: "#be123c",
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "#9f1239";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "#be123c";
                  }}
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  style={{
                    padding: "10px 12px",
                    border: "1.5px solid #fecdd3",
                    borderRadius: 10,
                    background: "transparent",
                    cursor: "pointer",
                    color: "#6b7280",
                    flexShrink: 0,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "#fff1f2";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <X size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 40 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="mobile-menu"
            style={{
              position: "absolute",
              top: 64,
              left: 0,
              bottom: 0,
              width: 300,
              maxWidth: "85vw",
              background: "white",
              overflowY: "auto",
              boxShadow: "4px 0 30px rgba(0,0,0,0.15)",
            }}
          >
            {/* User header */}
            {user && (
              <div
                style={{
                  padding: "20px 20px 16px",
                  background: "linear-gradient(135deg, #fff1f2, #ffe4e6)",
                  borderBottom: "1px solid #fecdd3",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #fda4af, #fb7185)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 700,
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <p style={{ margin: 0, fontWeight: 600, color: "#1f2937", fontSize: 15 }}>
                      {user.name}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        color: "#be123c",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Nav links */}
            <div style={{ padding: "12px 0" }}>
              {[
                { href: "/",        label: "Home",     emoji: "🏠" },
                { href: "/products",label: "Products", emoji: "🛍️" },
                ...(user
                  ? [
                      { href: "/cart",    label: `Cart${cartCount > 0 ? ` (${cartCount})` : ""}`, emoji: "🛒" },
                      { href: "/orders",  label: "My Orders", emoji: "📦" },
                      { href: "/profile", label: "Profile",   emoji: "👤" },
                    ]
                  : []),
                ...(user?.role === "ADMIN"
                  ? [{ href: "/admin", label: "Admin Panel", emoji: "⚙️" }]
                  : []),
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`mobile-link ${pathname === link.href ? "active" : ""}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 20px",
                    textDecoration: "none",
                    fontSize: 14,
                    color: pathname === link.href ? "#be123c" : "#374151",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>
                    {link.emoji}
                  </span>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth */}
            <div
              style={{
                padding: "12px 16px",
                borderTop: "1px solid #fff1f2",
                marginTop: "auto",
              }}
            >
              {user ? (
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 10,
                    border: "1.5px solid #fecdd3",
                    background: "transparent",
                    color: "#ef4444",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "#fef2f2";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <LogOut size={16} /> Logout
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Link
                    href="/auth/login"
                    style={{
                      display: "block",
                      padding: "12px",
                      borderRadius: 10,
                      border: "1.5px solid #fecdd3",
                      color: "#be123c",
                      textDecoration: "none",
                      textAlign: "center",
                      fontSize: 14,
                      fontWeight: 500,
                      transition: "all 0.2s ease",
                    }}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    style={{
                      display: "block",
                      padding: "12px",
                      borderRadius: 10,
                      background: "#be123c",
                      color: "white",
                      textDecoration: "none",
                      textAlign: "center",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}