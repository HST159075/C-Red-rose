"use client";
// src/app/page.tsx

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  Star,
  Sparkles,
} from "lucide-react";
import { productApi, categoryApi } from "@/lib/api";
import ProductCard from "@/components/product/ProductCard";
import { Product, Category } from "@/types";

interface ProductsResponse {
  data: Product[];
}
interface CategoriesResponse {
  data: Category[];
}

export default function HomePage() {
  const { data: productsData } = useQuery<ProductsResponse>({
    queryKey: ["products", "featured"],
    queryFn: async (): Promise<ProductsResponse> => {
      const r = await productApi.getAll({ limit: "8" });
      return r.data as ProductsResponse;
    },
  });

  const { data: categoriesData } = useQuery<CategoriesResponse>({
    queryKey: ["categories"],
    queryFn: async (): Promise<CategoriesResponse> => {
      const r = await categoryApi.getAll();
      return r.data as CategoriesResponse;
    },
  });

  const products: Product[] = productsData?.data || [];
  const categories: Category[] = categoriesData?.data || [];

  const catIcon = (slug: string) => {
    const m: Record<string, string> = {
      skincare: "🧴",
      makeup: "💄",
      fragrances: "✨",
      handbags: "👜",
    };
    return m[slug] ?? "🌹";
  };

  return (
    <div style={{ background: "#26091c", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

        /* ── Keyframes ── */
        @keyframes fadeUp   { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes floatY   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes orbPulse { 0%,100%{transform:scale(1);opacity:.3} 50%{transform:scale(1.18);opacity:.18} }
        @keyframes shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes lineGrow { from{scaleX:0} to{scaleX:1} }
        @keyframes countUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes badgePop { 0%{opacity:0;transform:scale(.8) translateY(-8px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes cardHover{ from{transform:translateY(0);box-shadow:0 4px 24px rgba(190,18,60,.07)} to{transform:translateY(-8px);box-shadow:0 24px 48px rgba(190,18,60,.18)} }

        /* ── Animation helpers ── */
        .afu  { animation: fadeUp .8s cubic-bezier(.16,1,.3,1) both; }
        .afu2 { animation: fadeUp .8s .18s cubic-bezier(.16,1,.3,1) both; }
        .afu3 { animation: fadeUp .8s .34s cubic-bezier(.16,1,.3,1) both; }
        .afu4 { animation: fadeUp .8s .5s cubic-bezier(.16,1,.3,1) both; }
        .afu5 { animation: fadeUp .8s .64s cubic-bezier(.16,1,.3,1) both; }
        .afi  { animation: fadeIn 1.2s .3s ease both; }
        .float  { animation: floatY 5s ease-in-out infinite; }
        .float2 { animation: floatY 6s 1.2s ease-in-out infinite; }
        .float3 { animation: floatY 4.5s 2.4s ease-in-out infinite; }
        .orb    { position:absolute;border-radius:50%;filter:blur(90px);animation:orbPulse 9s ease-in-out infinite;pointer-events:none; }

        /* ── Buttons ── */
        .hbp {
          display:inline-flex;align-items:center;gap:9px;
          padding:16px 36px;border-radius:100px;
          background:#be123c;color:white;
          font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;letter-spacing:.04em;
          text-decoration:none;
          transition:background .28s,transform .28s,box-shadow .28s;
          box-shadow:0 8px 32px rgba(190,18,60,.38);
        }
        .hbp:hover { background:#9f1239;transform:translateY(-3px);box-shadow:0 18px 48px rgba(190,18,60,.46); }
        .hbo {
          display:inline-flex;align-items:center;gap:9px;
          padding:15px 30px;border-radius:100px;
          border:1.5px solid rgba(255,255,255,.18);
          color:rgba(255,255,255,.8);
          font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;
          text-decoration:none;
          transition:border-color .28s,color .28s,background .28s,transform .28s;
        }
        .hbo:hover { border-color:rgba(255,255,255,.55);color:white;background:rgba(255,255,255,.07);transform:translateY(-2px); }

        /* ── Shimmer text ── */
        .shimmer-text {
          background: linear-gradient(90deg,#fda4af 0%,#fff 40%,#fda4af 60%,#fb7185 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }

        /* ── Gradient text ── */
        .grd-text { background:linear-gradient(135deg,#be123c,#f43f5e);-webkit-background-clip:text;-webkit-text-fill-color:transparent; }

        /* ── Feature cards ── */
        .feat-card {
          display:flex;align-items:flex-start;gap:14px;
          padding:22px 20px;border-radius:20px;
          background:rgba(255,255,255,.035);
          border:1px solid rgba(255,255,255,.07);
          backdrop-filter:blur(12px);
          transition:background .3s,transform .3s,border-color .3s;
        }
        .feat-card:hover { background:rgba(190,18,60,.1);border-color:rgba(190,18,60,.22);transform:translateY(-3px); }
        .feat-icon {
          width:46px;height:46px;border-radius:14px;
          background:rgba(190,18,60,.18);
          display:flex;align-items:center;justify-content:center;
          color:#fb7185;flex-shrink:0;
          transition:background .3s,color .3s;
        }
        .feat-card:hover .feat-icon { background:#be123c;color:white; }

        /* ── Category cards ── */
        .cat-card {
          position:relative;display:block;border-radius:26px;overflow:hidden;
          text-decoration:none;aspect-ratio:3/4;
          background:linear-gradient(160deg,#1a0810 0%,#2d0a18 100%);
          border:1px solid rgba(190,18,60,.15);
          transition:transform .45s cubic-bezier(.4,0,.2,1),box-shadow .45s cubic-bezier(.4,0,.2,1),border-color .3s;
          box-shadow:0 4px 20px rgba(0,0,0,.3);
        }
        .cat-card:hover { transform:translateY(-10px) scale(1.02);box-shadow:0 32px 64px rgba(190,18,60,.22);border-color:rgba(190,18,60,.4); }
        .cat-emoji { font-size:60px;position:absolute;top:50%;left:50%;transform:translate(-50%,-60%);transition:transform .45s cubic-bezier(.34,1.56,.64,1),filter .3s; }
        .cat-card:hover .cat-emoji { transform:translate(-50%,-65%) scale(1.15);filter:drop-shadow(0 0 20px rgba(251,113,133,.5)); }
        .cat-label {
          width:100%;padding:18px;border-radius:18px;
          background:rgba(10,3,5,.7);
          backdrop-filter:blur(16px);
          border:1px solid rgba(255,255,255,.07);
          text-align:center;
          transform:translateY(4px);
          transition:transform .4s ease,background .3s;
        }
        .cat-card:hover .cat-label { transform:translateY(0);background:rgba(159,18,57,.25); }
        .cat-reveal {
          max-height:0;overflow:hidden;opacity:0;
          transition:all .4s;
          font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
          color:#fb7185;
          display:flex;align-items:center;justify-content:center;gap:4px;
        }
        .cat-card:hover .cat-reveal { max-height:28px;opacity:1;margin-top:8px; }

        /* ── Section label ── */
        .sec-label {
          display:inline-flex;align-items:center;gap:6px;
          padding:5px 16px;border-radius:100px;
          background:rgba(190,18,60,.12);
          border:1px solid rgba(190,18,60,.22);
          color:#fb7185;
          font-family:'DM Sans',sans-serif;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;
          margin-bottom:14px;
        }

        /* ── Divider line ── */
        .divider {
          height:1px;
          background:linear-gradient(90deg,transparent,rgba(190,18,60,.3),transparent);
          border:none;margin:0;
        }

        /* ── Review cards ── */
        .review-card {
          padding:26px;border-radius:22px;
          background:rgba(255,255,255,.03);
          border:1.5px solid rgba(255,255,255,.07);
          backdrop-filter:blur(12px);
          transition:border-color .3s,transform .3s,background .3s;
        }
        .review-card:hover { border-color:rgba(190,18,60,.3);transform:translateY(-5px);background:rgba(190,18,60,.06); }

        /* ── Stat item ── */
        .stat-item { animation: countUp .8s cubic-bezier(.16,1,.3,1) both; }
        .stat-item:nth-child(1) { animation-delay:.5s; }
        .stat-item:nth-child(2) { animation-delay:.65s; }
        .stat-item:nth-child(3) { animation-delay:.8s; }

        /* ── Promo / CTA ── */
        .promo {
          border-radius:36px;
          background:linear-gradient(135deg,#0a0305 0%,#1c0910 60%,#0a0305 100%);
          color:white;text-align:center;
          position:relative;overflow:hidden;padding:80px 48px;
          border:1px solid rgba(190,18,60,.2);
        }
        .sub-wrap { display:flex;gap:10px;max-width:480px;margin:0 auto; }
        .sub-input {
          flex:1;padding:15px 24px;border-radius:100px;
          border:1.5px solid rgba(255,255,255,.1);
          background:rgba(255,255,255,.05);
          color:white;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;min-width:0;
          transition:border-color .3s;
        }
        .sub-input::placeholder { color:rgba(255,255,255,.3); }
        .sub-input:focus { border-color:rgba(251,113,133,.45); }
        .sub-btn {
          padding:15px 32px;border-radius:100px;
          background:#be123c;color:white;
          font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;letter-spacing:.04em;
          border:none;cursor:pointer;
          transition:background .3s,transform .3s,box-shadow .3s;
          box-shadow:0 8px 28px rgba(190,18,60,.38);flex-shrink:0;
        }
        .sub-btn:hover { background:#9f1239;transform:translateY(-2px);box-shadow:0 14px 36px rgba(190,18,60,.48); }

        /* ── Scroll reveal utility ── */
        .reveal { opacity:0;transform:translateY(28px);transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1); }
        .reveal.visible { opacity:1;transform:translateY(0); }

        /* ── Noise overlay ── */
        .noise {
          position:absolute;inset:0;pointer-events:none;z-index:1;opacity:.04;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size:200px 200px;
        }

        /* ── Responsive ── */
        @media(max-width:767px) {
          .hero-right { display:none!important; }
          .hero-grid  { grid-template-columns:1fr!important; }
          .feats      { grid-template-columns:1fr 1fr!important; }
          .cats       { grid-template-columns:1fr 1fr!important; }
          .prods      { grid-template-columns:1fr 1fr!important; }
          .promo      { padding:44px 20px!important;border-radius:24px!important; }
          .sub-wrap   { flex-direction:column!important; }
          .reviews    { grid-template-columns:1fr!important; }
          .stats-row  { gap:24px!important; }
        }
          /* Slider Container */
.slider-container {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  gap: 20px;
  padding: 20px 0;
  scrollbar-width: none; /* Firefox */
}

.slider-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

/* Protita Slide */
.slide-item {
  flex: 0 0 100%; /* Default mobile-e 100% */
  scroll-snap-align: start;
}

@media (min-width: 768px) {
  .slide-item {
    flex: 0 0 calc(33.33% - 14px); /* Desktop-e 3ta kore dekhabe */
  }
}
      `}</style>

      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section
        style={{
          position: "relative",
          minHeight: "94vh",
          display: "flex",
          alignItems: "center",
          background:
            "linear-gradient(140deg,#060103 0%,#120507 40%,#1e0a0f 70%,#0d0305 100%)",
          overflow: "hidden",
        }}
      >
        {/* Orbs */}
        <div
          className="orb"
          style={{
            width: 700,
            height: 700,
            background:
              "radial-gradient(circle,rgba(159,18,57,.55),transparent 68%)",
            top: -200,
            left: -200,
          }}
        />
        <div
          className="orb"
          style={{
            width: 500,
            height: 500,
            background:
              "radial-gradient(circle,rgba(190,18,60,.4),transparent 68%)",
            bottom: -100,
            right: -80,
            animationDelay: "4s",
          }}
        />
        <div
          className="orb"
          style={{
            width: 280,
            height: 280,
            background:
              "radial-gradient(circle,rgba(225,29,72,.35),transparent 70%)",
            top: "35%",
            right: "28%",
            animationDelay: "7s",
          }}
        />

        {/* Grid dots */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(rgba(255,255,255,.028) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
            zIndex: 0,
          }}
        />
        <div className="noise" />

        {/* Horizontal accent line */}
        <div
          style={{
            position: "absolute",
            bottom: "12%",
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg,transparent 0%,rgba(190,18,60,.25) 30%,rgba(190,18,60,.25) 70%,transparent 100%)",
            zIndex: 1,
          }}
        />

        <div
          className="page-container"
          style={{
            position: "relative",
            zIndex: 10,
            paddingTop: 100,
            paddingBottom: 100,
          }}
        >
          <div
            className="hero-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 64,
              alignItems: "center",
            }}
          >
            {/* LEFT */}
            <div>
              {/* Badge */}
              <div className="afu" style={{ marginBottom: 28 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 18px",
                    borderRadius: 100,
                    background: "rgba(190,18,60,.1)",
                    border: "1px solid rgba(190,18,60,.25)",
                    color: "#fda4af",
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: ".15em",
                    textTransform: "uppercase",
                    animation:
                      "badgePop .6s cubic-bezier(.34,1.56,.64,1) .1s both",
                  }}
                >
                  <Sparkles size={11} /> Premium Cosmetics 2026
                </span>
              </div>

              {/* Headline */}
              <h1
                className="afu2"
                style={{
                  fontFamily: "'Cormorant Garamond','Georgia',serif",
                  fontSize: "clamp(48px,5.8vw,84px)",
                  fontWeight: 600,
                  lineHeight: 1.06,
                  color: "white",
                  marginBottom: 24,
                  letterSpacing: "-.01em",
                }}
              >
                Beauty That
                <br />
                <em
                  className="shimmer-text"
                  style={{ fontStyle: "italic", fontWeight: 300 }}
                >
                  Blooms
                </em>
                <br />
                <span
                  style={{
                    color: "rgba(255,255,255,.38)",
                    fontSize: ".62em",
                    fontWeight: 300,
                    letterSpacing: "-.005em",
                  }}
                >
                  From Within
                </span>
              </h1>

              {/* Sub */}
              <p
                className="afu3"
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  color: "rgba(253,164,175,.6)",
                  fontSize: 15,
                  lineHeight: 1.8,
                  marginBottom: 40,
                  maxWidth: 400,
                  fontWeight: 300,
                }}
              >
                Discover our curated collection of premium skincare, makeup &
                fragrances. Quality you can trust, beauty you will love.
              </p>

              {/* CTA buttons */}
              <div
                className="afu4"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: 52,
                }}
              >
                <Link href="/products" className="hbp">
                  Shop Collection <ArrowRight size={15} />
                </Link>
                <Link href="/products?category=skincare" className="hbo">
                  Explore Skincare
                </Link>
              </div>

              {/* Stats */}
              <div
                className="stats-row afu5"
                style={{
                  display: "flex",
                  gap: 40,
                  paddingTop: 28,
                  borderTop: "1px solid rgba(255,255,255,.07)",
                }}
              >
                {(
                  [
                    ["10K+", "Happy Customers"],
                    ["500+", "Products"],
                    ["4.9★", "Avg Rating"],
                  ] as [string, string][]
                ).map(([n, l], i) => (
                  <div
                    key={n}
                    className="stat-item"
                    style={{ animationDelay: `${0.5 + i * 0.15}s` }}
                  >
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontSize: 28,
                        fontWeight: 600,
                        background: "linear-gradient(135deg,white,#fda4af)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {n}
                    </div>
                    <div
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: 11,
                        color: "rgba(253,164,175,.45)",
                        marginTop: 3,
                        fontWeight: 400,
                        letterSpacing: ".04em",
                      }}
                    >
                      {l}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT – floating cards */}
            <div
              className="hero-right afi"
              style={{ position: "relative", height: 500 }}
            >
              {/* Center card */}
              <div
                className="float"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  width: 200,
                  padding: 28,
                  borderRadius: 28,
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid rgba(255,255,255,.1)",
                  backdropFilter: "blur(24px)",
                  textAlign: "center",
                  boxShadow:
                    "0 24px 64px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.08)",
                }}
              >
                <div style={{ fontSize: 52, marginBottom: 10 }}>🌹</div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    color: "white",
                    fontWeight: 600,
                    fontSize: 16,
                  }}
                >
                  Premium Quality
                </div>
                <div
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    color: "rgba(253,164,175,.5)",
                    fontSize: 11,
                    marginTop: 5,
                    fontWeight: 300,
                  }}
                >
                  Clinically tested
                </div>
              </div>

              {/* Floating badges */}
              {(
                [
                  {
                    top: 22,
                    left: 0,
                    bottom: undefined,
                    right: undefined,
                    icon: <Truck size={15} color="#fb7185" />,
                    t: "Fast Delivery",
                    s: "All Bangladesh",
                    cls: "float2",
                  },
                  {
                    top: 60,
                    right: 0,
                    bottom: undefined,
                    left: undefined,
                    icon: <ShieldCheck size={15} color="#fb7185" />,
                    t: "100% Authentic",
                    s: "Genuine only",
                    cls: "float3",
                  },
                  {
                    bottom: 50,
                    left: 16,
                    top: undefined,
                    right: undefined,
                    icon: <Star size={15} color="#fb7185" />,
                    t: "Top Rated",
                    s: "4.9 / 5 stars",
                    cls: "float2",
                  },
                ] as {
                  top?: number;
                  left?: number;
                  bottom?: number;
                  right?: number;
                  icon: React.ReactNode;
                  t: string;
                  s: string;
                  cls: string;
                }[]
              ).map((c, i) => (
                <div
                  key={i}
                  className={c.cls}
                  style={{
                    position: "absolute",
                    top: c.top,
                    bottom: c.bottom,
                    left: c.left,
                    right: c.right,
                    padding: "12px 18px",
                    borderRadius: 18,
                    background: "rgba(255,255,255,.05)",
                    border: "1px solid rgba(255,255,255,.09)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,.3)",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: "rgba(190,18,60,.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {c.icon}
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: "'DM Sans',sans-serif",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "white",
                        }}
                      >
                        {c.t}
                      </div>
                      <div
                        style={{
                          fontFamily: "'DM Sans',sans-serif",
                          fontSize: 10,
                          color: "rgba(253,164,175,.45)",
                          fontWeight: 300,
                        }}
                      >
                        {c.s}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          FEATURES STRIP
      ══════════════════════════════ */}
      <section
        style={{
          background: "#26091c",
          padding: "40px 0",
          borderTop: "1px solid rgba(190,18,60,.12)",
          borderBottom: "1px solid rgba(190,18,60,.12)",
        }}
      >
        <div className="page-container">
          <div
            className="feats"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 14,
            }}
          >
            {(
              [
                {
                  icon: <Truck size={19} />,
                  t: "Fast Delivery",
                  s: "All over Bangladesh",
                },
                {
                  icon: <ShieldCheck size={19} />,
                  t: "100% Authentic",
                  s: "Genuine products only",
                },
                {
                  icon: <span style={{ fontSize: 17 }}>💵</span>,
                  t: "Cash on Delivery",
                  s: "Pay when you receive",
                },
                {
                  icon: <RefreshCw size={19} />,
                  t: "Easy Returns",
                  s: "7 day return policy",
                },
              ] as { icon: React.ReactNode; t: string; s: string }[]
            ).map((f) => (
              <div key={f.t} className="feat-card">
                <div className="feat-icon">{f.icon}</div>
                <div>
                  <div
                    style={{
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "rgba(255,255,255,.88)",
                    }}
                  >
                    {f.t}
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: 11,
                      color: "rgba(253,164,175,.4)",
                      marginTop: 3,
                      fontWeight: 300,
                    }}
                  >
                    {f.s}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          CATEGORIES
      ══════════════════════════════ */}
      {categories.length > 0 && (
        <section
          style={{
            padding: "96px 0",
            background: "#26091c",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            className="orb"
            style={{
              width: 500,
              height: 500,
              background:
                "radial-gradient(circle,rgba(159,18,57,.2),transparent 70%)",
              top: -100,
              right: -100,
              animationDelay: "2s",
            }}
          />
          <div
            className="page-container"
            style={{ position: "relative", zIndex: 2 }}
          >
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <span className="sec-label">
                <Sparkles size={11} /> Curated Collections
              </span>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond','Georgia',serif",
                  fontSize: "clamp(34px,4.2vw,58px)",
                  fontWeight: 600,
                  color: "white",
                  margin: 0,
                  letterSpacing: "-.02em",
                  lineHeight: 1.1,
                }}
              >
                Shop by{" "}
                <em
                  className="grd-text"
                  style={{ fontStyle: "italic", fontWeight: 300 }}
                >
                  Category
                </em>
              </h2>
            </div>
            <div
              className="cats"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(categories.length, 4)},1fr)`,
                gap: 22,
              }}
            >
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="cat-card"
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(160deg,#180810 0%,#2a0d18 100%)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage:
                        "radial-gradient(rgba(190,18,60,.08) 1px,transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />
                  <div className="cat-emoji">{catIcon(cat.slug)}</div>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      padding: 18,
                    }}
                  >
                    <div className="cat-label">
                      <div
                        style={{
                          fontFamily: "'Cormorant Garamond',serif",
                          fontSize: 17,
                          fontWeight: 600,
                          color: "rgba(255,255,255,.9)",
                          letterSpacing: "-.01em",
                        }}
                      >
                        {cat.name}
                      </div>
                      {cat._count && (
                        <div
                          style={{
                            fontFamily: "'DM Sans',sans-serif",
                            fontSize: 11,
                            color: "#fb7185",
                            marginTop: 4,
                            fontWeight: 500,
                          }}
                        >
                          {cat._count.products} products
                        </div>
                      )}
                      <div className="cat-reveal">
                        Explore <ArrowRight size={11} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <hr className="divider" />

      {/* ══════════════════════════════
          PRODUCTS
      ══════════════════════════════ */}
      <section
        style={{
          padding: "96px 0",
          background: "#26091c",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="orb"
          style={{
            width: 400,
            height: 400,
            background:
              "radial-gradient(circle,rgba(190,18,60,.15),transparent 70%)",
            bottom: -80,
            left: -80,
          }}
        />
        <div
          className="page-container"
          style={{ position: "relative", zIndex: 2 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: 48,
            }}
          >
            <div>
              <span className="sec-label">Trending Now</span>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond','Georgia',serif",
                  fontSize: "clamp(30px,3.8vw,50px)",
                  fontWeight: 600,
                  color: "white",
                  margin: 0,
                  letterSpacing: "-.02em",
                  lineHeight: 1.1,
                }}
              >
                Featured Products
              </h2>
            </div>
            <Link
              href="/products"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "#fb7185",
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: 600,
                fontSize: 13,
                textDecoration: "none",
                letterSpacing: ".04em",
                transition: "gap .25s,color .25s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.gap = "10px";
                (e.currentTarget as HTMLElement).style.color = "#fda4af";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.gap = "6px";
                (e.currentTarget as HTMLElement).style.color = "#fb7185";
              }}
            >
              View All <ArrowRight size={15} />
            </Link>
          </div>

          {products.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 0",
                color: "rgba(255,255,255,.3)",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>🌹</div>
              <p
                style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 300 }}
              >
                No products yet. Check back soon!
              </p>
            </div>
          ) : (
            <div
              className="prods"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 22,
              }}
            >
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <hr className="divider" />

      {/* ══════════════════════════════
          REVIEWS
      ══════════════════════════════ */}
      <section
        style={{
          padding: "96px 0",
          background: "#26091c",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="orb"
          style={{
            width: 450,
            height: 450,
            background:
              "radial-gradient(circle,rgba(159,18,57,.18),transparent 70%)",
            top: -80,
            right: -60,
            animationDelay: "3s",
          }}
        />
        <div
          className="page-container"
          style={{ position: "relative", zIndex: 2 }}
        >
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <span className="sec-label">
              <Star size={11} /> What They Say
            </span>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond','Georgia',serif",
                fontSize: "clamp(30px,3.8vw,50px)",
                fontWeight: 600,
                color: "white",
                margin: 0,
                letterSpacing: "-.02em",
              }}
            >
              Customer Love
            </h2>
          </div>
          <div
            className="reviews"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 22,
            }}
          >
            {(
              [
                {
                  name: "Nadia Rahman",
                  loc: "Dhaka",
                  review:
                    "Absolutely love the skincare products! My skin has never felt better. Will definitely order again.",
                  rating: 5,
                },
                {
                  name: "Fatema Akter",
                  loc: "Chittagong",
                  review:
                    "Fast delivery and authentic products. The packaging was beautiful too. Highly recommended!",
                  rating: 5,
                },
                {
                  name: "Rokeya Begum",
                  loc: "Sylhet",
                  review:
                    "Cash on delivery was so convenient. The perfume I ordered smells amazing. Very happy!",
                  rating: 5,
                },
              ] as {
                name: string;
                loc: string;
                review: string;
                rating: number;
              }[]
            ).map((r) => (
              <div key={r.name} className="review-card">
                <div style={{ display: "flex", marginBottom: 14 }}>
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      style={{
                        color: "#f59e0b",
                        fill: "#f59e0b",
                        marginRight: 2,
                      }}
                    />
                  ))}
                </div>
                <p
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: 14,
                    color: "rgba(255,255,255,.65)",
                    lineHeight: 1.75,
                    marginBottom: 18,
                    fontWeight: 300,
                  }}
                >
                  {r.review}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#9f1239,#e11d48)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontFamily: "'Cormorant Garamond',serif",
                      fontWeight: 600,
                      fontSize: 16,
                    }}
                  >
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "rgba(255,255,255,.88)",
                      }}
                    >
                      {r.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: 11,
                        color: "rgba(253,164,175,.4)",
                        fontWeight: 300,
                      }}
                    >
                      {r.loc}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          PROMO / SUBSCRIBE
      ══════════════════════════════ */}
      <section style={{ padding: "40px 0 96px", background: "#26091c" }}>
        <div className="page-container">
          <div className="promo">
            <div
              className="orb"
              style={{
                width: 450,
                height: 450,
                background: "radial-gradient(circle,#9f1239,transparent 70%)",
                top: -120,
                left: -120,
              }}
            />
            <div
              className="orb"
              style={{
                width: 350,
                height: 350,
                background: "radial-gradient(circle,#be123c,transparent 70%)",
                bottom: -90,
                right: -70,
                animationDelay: "4.5s",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,.025) 1px,transparent 1px)",
                backgroundSize: "32px 32px",
                zIndex: 1,
              }}
            />
            <div className="noise" />
            <div
              style={{
                position: "relative",
                zIndex: 2,
                maxWidth: 560,
                margin: "0 auto",
              }}
            >
              <span className="sec-label">
                <Sparkles size={11} /> Exclusive Offer
              </span>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond','Georgia',serif",
                  fontSize: "clamp(32px,4.2vw,58px)",
                  fontWeight: 600,
                  color: "white",
                  lineHeight: 1.12,
                  marginBottom: 14,
                  letterSpacing: "-.02em",
                }}
              >
                Join the{" "}
                <em
                  style={{
                    color: "#fda4af",
                    fontStyle: "italic",
                    fontWeight: 300,
                  }}
                >
                  Beauty Club
                </em>
              </h2>
              <p
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  color: "rgba(253,164,175,.5)",
                  fontSize: 15,
                  lineHeight: 1.75,
                  marginBottom: 34,
                  fontWeight: 300,
                }}
              >
                Subscribe and get 10% off your first order plus exclusive access
                to new arrivals.
              </p>
              <form className="sub-wrap" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Your email address"
                  className="sub-input"
                />
                <button type="submit" className="sub-btn">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
