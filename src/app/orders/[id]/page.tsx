"use client";
// src/app/orders/[id]/page.tsx

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, MapPin, Phone, Package } from "lucide-react";
import { orderApi, getImageUrl } from "@/lib/api";
import { formatPrice, formatDate, getOrderStatusColor, getOrderStatusLabel } from "@/lib/utils";
import { toast } from "sonner";

import { Order, OrderItem, OrderStatus } from "@/types";
import { useState } from "react";

interface OrderDetailResponse {
  data: Order;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);

  const { data, isLoading, refetch } = useQuery<OrderDetailResponse>({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await orderApi.getById(id);
      return res.data as OrderDetailResponse;
    },
  });

  const order: Order | undefined = data?.data;

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      setCancelling(true);
      await orderApi.cancel(id);
      toast.success("Order cancelled successfully");
      refetch();
    } catch (err) {
  const error = err as { response?: { data?: { message?: string } } };
  toast.error(error?.response?.data?.message || "Cannot cancel order");
} finally {
      setCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container py-10 animate-pulse">
        <div className="h-8 bg-rose-100 rounded w-48 mb-6" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 bg-rose-100 rounded-xl" />
          <div className="h-64 bg-rose-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!order) return (
    <div className="page-container py-20 text-center">
      <p className="text-gray-500">Order not found</p>
      <button onClick={() => router.back()} className="btn-primary mt-4">Go Back</button>
    </div>
  );

  const statusSteps: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="page-container py-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-rose-700 mb-6 transition-colors text-sm"
      >
        <ArrowLeft size={16} /> Back to Orders
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`badge text-sm px-3 py-1 ${getOrderStatusColor(order.status)}`}>
            {getOrderStatusLabel(order.status)}
          </span>
          {order.status === "PENDING" && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="text-sm text-red-600 hover:text-red-800 border border-red-200 rounded-lg px-3 py-1 hover:bg-red-50 transition-colors disabled:opacity-60"
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </div>
      </div>

      {/* Progress tracker */}
      {order.status !== "CANCELLED" && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-5">Order Progress</h2>
          <div className="flex items-center">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i <= currentStep ? "bg-rose-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                    {i <= currentStep ? "✓" : i + 1}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 text-center hidden md:block">
                    {getOrderStatusLabel(step)}
                  </span>
                </div>
                {i < statusSteps.length - 1 && (
                  <div className={`flex-1 h-1 mx-1 rounded transition-colors ${i < currentStep ? "bg-rose-500" : "bg-gray-100"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Items */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package size={18} className="text-rose-600" /> Items
          </h2>
          <div className="space-y-4">
            {order.items.map((item: OrderItem) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-rose-50">
                  <Image src={getImageUrl(item.product.mainImg)} alt={item.product.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.product.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  <p className="text-sm font-bold text-rose-700 mt-1">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-rose-50 mt-4 pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-rose-700">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>

        {/* Delivery & Payment */}
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-rose-600" /> Delivery Address
            </h2>
            <p className="text-gray-700 text-sm">{order.address}</p>
            <p className="text-gray-700 text-sm">
              {order.city}{order.postalCode ? ` - ${order.postalCode}` : ""}
            </p>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Phone size={18} className="text-rose-600" /> Contact
            </h2>
            <p className="text-gray-700 text-sm">{order.phone}</p>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-gray-800 mb-3">Payment</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Method</span>
              <span className="text-sm font-medium">💵 Cash on Delivery</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-600">Status</span>
              <span className={`badge text-xs ${order.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {order.paymentStatus === "PAID" ? "✅ Paid" : "⏳ Unpaid"}
              </span>
            </div>
          </div>

          {order.note && (
            <div className="card p-6">
              <h2 className="font-semibold text-gray-800 mb-2">Note</h2>
              <p className="text-gray-600 text-sm">{order.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}