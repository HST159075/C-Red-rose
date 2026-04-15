"use client";
// src/components/product/CategorySlider.tsx

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowLeft, ShoppingCart, Star } from "lucide-react";
import { productApi, categoryApi, getImageUrl } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { authClient } from "@/lib/auth-client";
import { formatPrice, getDiscountPercent } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Product, Category } from "@/types";

interface CategoriesResponse { data: Category[] }
interface ProductsResponse { data: Product[] }

interface Slide {
  category: Category;
  product: Product | null;
}

// ── Separate component that loads ONE category's product ──────
function SlideContent({
  category,
  onAddToCart,
}: {
  category: Category;
  onAddToCart: (p: Product) => void;
}) {
  const { data } = useQuery<ProductsResponse>({
    queryKey: ["slider-product", category.slug],
    queryFn: async () => {
      const res = await productApi.getAll({ category: category.slug, limit: "1", page: "1" });
      return res.data as ProductsResponse;
    },
  });

  const product = data?.data?.[0] ?? null;
  const price = product ? (product.salePrice ?? product.regularPrice) : 0;
  const discount = product?.salePrice ? getDiscountPercent(product.regularPrice, product.salePrice) : null;

  const catIcon = { skincare: "🧴", makeup: "💄", fragrances: "✨", handbags: "👜" } as Record<string, string>;

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:40, alignItems:"center", minHeight:320 }}>
      {/* Left — info */}
      <div>
        <div style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"5px 14px",borderRadius:100,background:"rgba(190,18,60,.14)",border:"1px solid rgba(190,18,60,.25)",color:"#fb7185",fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",marginBottom:16 }}>
          {category.name}
        </div>

        {product ? (
          <>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(20px,2.5vw,32px)",fontWeight:600,color:"white",lineHeight:1.2,marginBottom:12,letterSpacing:"-.01em" }}>
              {product.name}
            </h3>

            {product.avgRating && (
              <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:12 }}>
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={12} style={{ color:s<=Math.round(product.avgRating||0)?"#f59e0b":"rgba(255,255,255,.15)",fill:s<=Math.round(product.avgRating||0)?"#f59e0b":"rgba(255,255,255,.15)" }} />
                ))}
                {product.totalReviews && <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"rgba(253,164,175,.5)" }}>({product.totalReviews})</span>}
              </div>
            )}

            {product.description && (
              <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"rgba(253,164,175,.5)",lineHeight:1.7,marginBottom:20,fontWeight:300,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" }}>
                {product.description}
              </p>
            )}

            <div style={{ display:"flex",alignItems:"baseline",gap:10,marginBottom:24 }}>
              <span style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:30,fontWeight:600,color:"#fb7185" }}>{formatPrice(price)}</span>
              {product.salePrice && <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"rgba(255,255,255,.25)",textDecoration:"line-through" }}>{formatPrice(product.regularPrice)}</span>}
              {discount && <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:100,background:"rgba(190,18,60,.2)",color:"#fb7185" }}>-{discount}%</span>}
            </div>

            <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
              <button
                onClick={() => onAddToCart(product)}
                disabled={product.stock === 0}
                style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"13px 26px",borderRadius:100,background:"#be123c",color:"white",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,border:"none",cursor:product.stock===0?"not-allowed":"pointer",opacity:product.stock===0?.5:1,transition:"all .3s",boxShadow:"0 8px 28px rgba(190,18,60,.38)" }}
              >
                <ShoppingCart size={14} />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
              <Link
                href={`/products/${product.slug}`}
                style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"13px 20px",borderRadius:100,border:"1.5px solid rgba(255,255,255,.12)",color:"rgba(255,255,255,.7)",fontFamily:"'DM Sans',sans-serif",fontSize:13,textDecoration:"none",transition:"all .25s" }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(190,18,60,.4)";(e.currentTarget as HTMLElement).style.color="#fb7185";}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,.12)";(e.currentTarget as HTMLElement).style.color="rgba(255,255,255,.7)";}}
              >
                Details <ArrowRight size={12} />
              </Link>
            </div>
          </>
        ) : (
          <div style={{ color:"rgba(255,255,255,.3)",fontFamily:"'DM Sans',sans-serif",fontSize:14,marginTop:20 }}>
            No products yet.
            <Link href={`/products?category=${category.slug}`} style={{ display:"block",marginTop:12,color:"#fb7185",textDecoration:"none",fontSize:13 }}>Browse {category.name} →</Link>
          </div>
        )}
      </div>

      {/* Right — image */}
      <div style={{ display:"flex",justifyContent:"center" }}>
        {product ? (
          <Link href={`/products/${product.slug}`} style={{ display:"block",position:"relative",width:"100%",maxWidth:260,aspectRatio:"1",borderRadius:20,overflow:"hidden",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)" }}>
            <Image src={getImageUrl(product.mainImg)} alt={product.name} fill className="object-cover" />
            {discount && (
              <span style={{ position:"absolute",top:12,left:12,background:"#be123c",color:"white",fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:100,fontFamily:"'DM Sans',sans-serif" }}>
                -{discount}% OFF
              </span>
            )}
          </Link>
        ) : (
          <div style={{ width:"100%",maxWidth:260,aspectRatio:"1",borderRadius:20,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:64 }}>
            {catIcon[category.slug] ?? "🌹"}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Slider ───────────────────────────────────────────────
export default function CategorySlider() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { addToCart } = useCartStore();
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState<"right" | "left">("right");
  const [animKey, setAnimKey] = useState(0);

  const { data: categoriesData, isLoading } = useQuery<CategoriesResponse>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoryApi.getAll();
      return res.data as CategoriesResponse;
    },
  });

  const categories: Category[] = categoriesData?.data || [];

  const goTo = useCallback((idx: number, direction: "right" | "left") => {
    setDir(direction);
    setAnimKey((k) => k + 1);
    setCurrent(idx);
  }, []);

  const prev = useCallback(() => {
    if (categories.length === 0) return;
    goTo((current - 1 + categories.length) % categories.length, "left");
  }, [current, categories.length, goTo]);

  const next = useCallback(() => {
    if (categories.length === 0) return;
    goTo((current + 1) % categories.length, "right");
  }, [current, categories.length, goTo]);

  useEffect(() => {
    if (categories.length < 2) return;
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [next, categories.length]);

  if (isLoading) {
    return (
      <div style={{ height:360,background:"rgba(255,255,255,.03)",borderRadius:28,border:"1px solid rgba(190,18,60,.12)",display:"flex",alignItems:"center",justifyContent:"center" }}>
        <div style={{ textAlign:"center",color:"rgba(253,164,175,.4)" }}>
          <div style={{ fontSize:32,marginBottom:8 }}>🌹</div>
          <div style={{ fontSize:13,fontFamily:"'DM Sans',sans-serif" }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) return null;

  const handleAddToCart = async (product: Product) => {
    if (!session?.user) { toast.error("Please login first"); router.push("/auth/login"); return; }
    try { await addToCart(product.id, 1); toast.success(`${product.name} added!`); }
    catch { toast.error("Failed to add to cart"); }
  };

  return (
    <div>
      <style>{`
        @keyframes slideInR { from{opacity:0;transform:translateX(50px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideInL { from{opacity:0;transform:translateX(-50px)} to{opacity:1;transform:translateX(0)} }
        .cs-in-r { animation: slideInR .38s cubic-bezier(.16,1,.3,1) both; }
        .cs-in-l { animation: slideInL .38s cubic-bezier(.16,1,.3,1) both; }
        .cs-btn { width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.7);cursor:pointer;transition:all .25s; }
        .cs-btn:hover { background:rgba(190,18,60,.3);border-color:rgba(190,18,60,.5);color:white;transform:scale(1.08); }
        .cs-dot { width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.2);border:none;cursor:pointer;transition:all .3s;padding:0; }
        .cs-dot.active { width:22px;border-radius:4px;background:#be123c; }
        @media(max-width:767px) { .cs-inner { grid-template-columns:1fr!important; } .cs-img { display:none!important; } }
      `}</style>

      {/* Slide */}
      <div
        key={animKey}
        className={dir === "right" ? "cs-in-r" : "cs-in-l"}
        style={{ background:"rgba(255,255,255,.025)",border:"1px solid rgba(190,18,60,.14)",borderRadius:28,padding:"40px 48px",backdropFilter:"blur(12px)" }}
      >
        <SlideContent
          category={categories[current]}
          onAddToCart={handleAddToCart}
        />
      </div>

      {/* Controls */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:18 }}>
        <div style={{ display:"flex",gap:6,alignItems:"center" }}>
          {categories.map((_, i) => (
            <button key={i} className={`cs-dot ${i===current?"active":""}`} onClick={() => goTo(i, i>current?"right":"left")} />
          ))}
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <button className="cs-btn" onClick={prev}><ArrowLeft size={16} /></button>
          <button className="cs-btn" onClick={next}><ArrowRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}
