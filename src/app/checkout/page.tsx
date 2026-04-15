"use client";
// src/app/checkout/page.tsx

import { useState, useEffect } from "react";
import Image from "next/image";
import { MapPin, Phone, FileText, CheckCircle } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { authClient } from "@/lib/auth-client";
import { orderApi, getImageUrl } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

interface OrderResponse {
  data: { orderId: string };
}

export default function CheckoutPage() {
  const { cart, fetchCart } = useCartStore();
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [orderId, setOrderId] = useState("");

  const [form, setForm] = useState({
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    note: "",
  });

  useEffect(() => {
    if (session?.user) fetchCart();
  }, [session]);

  if (!session?.user) {
    return (
      <div className="page-container py-20 text-center">
        <p className="text-gray-500 mb-4">Please login to checkout</p>
        <Link href="/auth/login" className="btn-primary">Login</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      setLoading(true);
      const res = await orderApi.create({
        items: cart.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        address: form.address,
        city: form.city,
        postalCode: form.postalCode,
        phone: form.phone,
        note: form.note,
      });
      const resData = res.data as OrderResponse;
      setOrderId(resData.data.orderId);
      setOrdered(true);
      toast.success("Order placed successfully! 🎉");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (ordered) {
    return (
      <div className="page-container py-20 text-center">
        <div className="max-w-md mx-auto card p-10 animate-fade-in">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Order Placed! 🎉</h2>
          <p className="text-gray-500 mb-2">
            Order ID: <strong>#{orderId.slice(-8).toUpperCase()}</strong>
          </p>
          <p className="text-gray-500 mb-6 text-sm">
            A confirmation email has been sent. Our team will contact you shortly.
          </p>
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6 text-sm text-green-700">
            💵 Please keep <strong>{formatPrice(cart?.total || 0)}</strong> ready for Cash on Delivery.
          </div>
          <div className="flex gap-3">
            <Link href="/orders" className="btn-primary flex-1 text-center">View Orders</Link>
            <Link href="/products" className="btn-outline flex-1 text-center">Shop More</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <h1 className="section-title mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <MapPin size={18} className="text-rose-600" /> Delivery Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Address *</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House no, Road, Area" className="input" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">City *</label>
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Chittagong" className="input" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Postal Code</label>
                <input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} placeholder="4100" className="input" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <Phone size={18} className="text-rose-600" /> Contact
            </h2>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Phone Number *</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" className="input" required />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <FileText size={18} className="text-rose-600" /> Order Note (Optional)
            </h2>
            <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Any special instructions..." className="input resize-none h-20" />
          </div>

          <button type="submit" disabled={loading || !cart || cart.items.length === 0}
            className="btn-primary w-full py-4 text-base disabled:opacity-60">
            {loading ? "Placing Order..." : `Place Order — ${formatPrice(cart?.total || 0)}`}
          </button>
        </form>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="card p-6 sticky top-20">
            <h2 className="font-semibold text-gray-800 mb-5">Order Summary</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {cart?.items.map((item) => {
                const price = item.product.salePrice ?? item.product.regularPrice;
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-rose-50">
                      <Image src={getImageUrl(item.product.mainImg)} alt={item.product.name} fill className="object-cover" />
                      <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 line-clamp-2 leading-snug">{item.product.name}</p>
                      <p className="text-sm font-bold text-rose-700 mt-1">{formatPrice(price * item.quantity)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-rose-100 pt-4 mb-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-rose-700">{formatPrice(cart?.total || 0)}</span>
              </div>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-sm text-green-700">
              <p className="font-semibold mb-1">💵 Cash on Delivery</p>
              <p className="text-xs text-green-600">Pay when you receive your order</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}