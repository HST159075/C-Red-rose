"use client";
// src/app/orders/page.tsx

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { orderApi } from "@/lib/api";
import { Order } from "@/types";
import { formatPrice, formatDate, getOrderStatusColor, getOrderStatusLabel } from "@/lib/utils";

interface OrdersResponse {
  data: Order[];
}

export default function OrdersPage() {
  const { data: session } = authClient.useSession();

  const { data, isLoading } = useQuery<OrdersResponse>({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const res = await orderApi.getMy();
      return res.data as OrdersResponse;
    },
    enabled: !!session?.user,
  });

  const orders: Order[] = data?.data || [];

  if (!session?.user) {
    return (
      <div className="page-container py-20 text-center">
        <p className="text-gray-500 mb-4">Please login to view your orders</p>
        <Link href="/auth/login" className="btn-primary">Login</Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page-container py-10">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-rose-50 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <h1 className="section-title mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={64} className="mx-auto text-rose-200 mb-4" />
          <h2 className="font-display text-xl font-bold text-gray-800 mb-2">No Orders Yet</h2>
          <p className="text-gray-500 mb-6">Start shopping to place your first order!</p>
          <Link href="/products" className="btn-primary">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="font-semibold text-gray-800">
                    Order #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${getOrderStatusColor(order.status)}`}>
                    {getOrderStatusLabel(order.status)}
                  </span>
                  <span className={`badge ${order.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {order.paymentStatus === "PAID" ? "✅ Paid" : "💵 COD"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.slice(0, 2).map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm text-gray-600">
                    <Package size={14} className="text-rose-400 flex-shrink-0" />
                    <span className="truncate">{item.product.name}</span>
                    <span className="flex-shrink-0">× {item.quantity}</span>
                    <span className="flex-shrink-0 font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p className="text-xs text-gray-400">+{order.items.length - 2} more items</p>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-rose-50 pt-3">
                <div className="text-sm">
                  <span className="text-gray-500">Total: </span>
                  <span className="font-bold text-rose-700">{formatPrice(order.totalAmount)}</span>
                </div>
                <Link href={`/orders/${order.id}`} className="flex items-center gap-1 text-sm text-rose-600 hover:text-rose-800 font-medium transition-colors">
                  View Details <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}