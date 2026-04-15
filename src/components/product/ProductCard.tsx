"use client";
// src/components/product/ProductCard.tsx

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { Product } from "@/types";
import { formatPrice, getDiscountPercent } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getImageUrl } from "@/lib/api";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCartStore();
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session?.user) {
      toast.error("Please login to add to cart");
      router.push("/auth/login");
      return;
    }
    try {
      await addToCart(product.id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const price = product.salePrice ?? product.regularPrice;
  const discount = product.salePrice
    ? getDiscountPercent(product.regularPrice, product.salePrice)
    : null;

  return (
    <Link href={`/products/${product.slug}`} className="group product-card block">
      <div className="relative overflow-hidden rounded-xl bg-rose-50 aspect-square">
        <Image
          src={getImageUrl(product.mainImg)}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {discount && (
          <span className="absolute top-2 left-2 bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discount}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-sm font-semibold px-4 py-2 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="absolute bottom-0 left-0 right-0 bg-rose-700 text-white py-3 text-sm font-medium
            translate-y-full group-hover:translate-y-0 transition-transform duration-300
            flex items-center justify-center gap-2 disabled:bg-gray-400"
        >
          <ShoppingCart size={16} />
          Add to Cart
        </button>
      </div>

      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-rose-700 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {product.avgRating && (
          <div className="flex items-center gap-1 mt-1">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-gray-500">
              {product.avgRating.toFixed(1)} ({product.totalReviews})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-rose-700">{formatPrice(price)}</span>
          {product.salePrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.regularPrice)}
            </span>
          )}
        </div>

        {/* Stock warning */}
        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-xs text-orange-500 mt-1">Only {product.stock} left!</p>
        )}
      </div>
    </Link>
  );
}
