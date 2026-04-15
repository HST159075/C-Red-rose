"use client";
// src/app/products/[slug]/page.tsx

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShoppingCart,
  Star,
  Package,
  ArrowLeft,
  Minus,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { productApi, reviewApi, getImageUrl } from "@/lib/api";
import { Review, Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { authClient } from "@/lib/auth-client";
import { formatPrice, getDiscountPercent, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface ProductDetailResponse {
  data: Product;
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { addToCart } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const { data, isLoading, refetch } = useQuery<ProductDetailResponse>({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await productApi.getBySlug(slug);
      return res.data as ProductDetailResponse;
    },
  });
  const product: Product | undefined = data?.data;

  const handleAddToCart = async () => {
    if (!session?.user) {
      toast.error("Please login first");
      router.push("/auth/login");
      return;
    }
    if (!product) return;
    try {
      await addToCart(product.id, quantity);
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      toast.error("Please login to review");
      return;
    }
    if (!product) return;
    try {
      setSubmittingReview(true);
      await reviewApi.add({ productId: product.id, rating, comment });
      toast.success("Review submitted!");
      setComment("");
      refetch();
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container py-10">
        <div className="grid md:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-square bg-rose-100 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-rose-100 rounded w-3/4" />
            <div className="h-4 bg-rose-100 rounded w-1/2" />
            <div className="h-10 bg-rose-100 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product)
    return (
      <div className="page-container py-20 text-center">
        <p className="text-5xl mb-4">😕</p>
        <p className="text-gray-500 text-lg">Product not found</p>
        <button onClick={() => router.back()} className="btn-primary mt-4">
          Go Back
        </button>
      </div>
    );

  const price = product.salePrice ?? product.regularPrice;
  const discount = product.salePrice
    ? getDiscountPercent(product.regularPrice, product.salePrice)
    : null;

  return (
    <div className="page-container py-10">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-rose-700 mb-6 transition-colors text-sm"
      >
        <ArrowLeft size={16} /> Back to Products
      </button>

      <div className="grid md:grid-cols-2 gap-10 mb-16">
        {/* Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-rose-50">
          <Image
            src={getImageUrl(product.mainImg)}
            alt={product.name}
            fill
            className="object-cover"
          />
          {discount && (
            <span className="absolute top-4 left-4 bg-rose-600 text-white font-bold px-3 py-1 rounded-full text-sm">
              -{discount}% OFF
            </span>
          )}
        </div>

        {/* Info */}
        <div className="animate-fade-in">
          {product.category && (
            <span className="badge bg-rose-100 text-rose-700 mb-3">
              {product.category.name}
            </span>
          )}
          <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            {product.name}
          </h1>

          {/* Rating */}
          {product.reviews && product.reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    className={`${s <= Math.round(product.avgRating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                ({product.reviews.length} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-3xl font-bold text-rose-700">
              {formatPrice(price)}
            </span>
            {product.salePrice && (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(product.regularPrice)}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-gray-600 leading-relaxed mb-6">
              {product.description}
            </p>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <Package
              size={16}
              className={product.stock > 0 ? "text-green-500" : "text-red-400"}
            />
            <span
              className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          {/* Quantity */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-700">
                Quantity:
              </span>
              <div className="flex items-center border border-rose-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-rose-50 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 py-2 font-medium text-sm border-x border-rose-200">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  className="px-3 py-2 hover:bg-rose-50 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={20} />
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>

          {/* COD badge */}
          <div className="mt-4 flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
            <span className="text-xl">💵</span>
            <p className="text-sm text-green-700 font-medium">
              Cash on Delivery available
            </p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="border-t border-rose-100 pt-10">
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
          Customer Reviews
        </h2>

        {/* Review form */}
        {session?.user && (
          <form onSubmit={handleReview} className="card p-6 mb-8">
            <h3 className="font-semibold text-gray-800 mb-4">Write a Review</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600">Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setRating(s)}>
                    <Star
                      size={24}
                      className={`${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"} hover:text-yellow-400 transition-colors`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this product..."
              className="input resize-none h-24 mb-4"
            />
            <button
              type="submit"
              disabled={submittingReview}
              className="btn-primary"
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}

        {/* Reviews list */}
        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((review: Review) => (
              <div key={review.id} className="card p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-sm">
                      {review.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {review.user.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={
                          s <= review.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-200 fill-gray-200"
                        }
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <Star size={32} className="mx-auto mb-3 text-rose-200" />
            <p>No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>
    </div>
  );
}
