"use client";
// src/app/cart/page.tsx

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { authClient } from "@/lib/auth-client";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/api";

export default function CartPage() {
  const { cart, fetchCart, updateItem, removeItem, isLoading } = useCartStore();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user) fetchCart();
  }, [session]);

  if (!session?.user) {
    return (
      <div className="page-container py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-rose-200 mb-4" />
        <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">
          Please Login
        </h2>
        <p className="text-gray-500 mb-6">Login to view your cart</p>
        <Link href="/auth/login" className="btn-primary">
          Login
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page-container py-10">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-rose-50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="page-container py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-rose-200 mb-4" />
        <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-gray-500 mb-6">Add some products to get started</p>
        <Link href="/products" className="btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  const handleUpdate = async (itemId: string, quantity: number) => {
    try {
      await updateItem(itemId, quantity);
    } catch {
      toast.error("Failed to update cart");
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeItem(itemId);
      toast.success("Item removed");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  return (
    <div className="page-container py-10">
      <h1 className="section-title mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const price = item.product.salePrice ?? item.product.regularPrice;
            return (
              <div
                key={item.id}
                className="card p-4 flex gap-4 animate-fade-in"
              >
                {/* Image */}
                <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-rose-50">
                  <Image
                    src={getImageUrl(item.product.mainImg)}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 text-sm leading-snug line-clamp-2">
                    {item.product.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-rose-700">
                      {formatPrice(price)}
                    </span>
                    {item.product.salePrice && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(item.product.regularPrice)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity */}
                    <div className="flex items-center border border-rose-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleUpdate(item.id, item.quantity - 1)}
                        className="px-2.5 py-1.5 hover:bg-rose-50 transition-colors text-gray-600"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-medium border-x border-rose-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdate(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="px-2.5 py-1.5 hover:bg-rose-50 transition-colors text-gray-600 disabled:opacity-40"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-800 text-sm">
                        {formatPrice(price * item.quantity)}
                      </span>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div>
          <div className="card p-6 sticky top-20">
            <h2 className="font-semibold text-gray-800 text-lg mb-5">
              Order Summary
            </h2>

            <div className="space-y-3 mb-5">
              {cart.items.map((item) => {
                const price =
                  item.product.salePrice ?? item.product.regularPrice;
                return (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm text-gray-600"
                  >
                    <span className="truncate max-w-[180px]">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatPrice(price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-rose-100 pt-4 mb-5">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-rose-700">{formatPrice(cart.total)}</span>
              </div>
            </div>

            {/* COD badge */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-5 flex items-center gap-2">
              <span>💵</span>
              <p className="text-sm text-green-700 font-medium">
                Cash on Delivery
              </p>
            </div>

            <Link
              href="/checkout"
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              Proceed to Checkout <ArrowRight size={18} />
            </Link>

            <Link
              href="/products"
              className="btn-outline w-full text-center mt-3 py-2.5 text-sm block"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
