"use client";
// src/app/admin/orders/page.tsx

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Order, OrderStatus } from "@/types";
import { formatPrice, formatDate, getOrderStatusColor, getOrderStatusLabel } from "@/lib/utils";
import { toast } from "sonner";

const STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const qc = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

 const { data, isLoading } = useQuery({
  queryKey: ["admin-orders", filterStatus],
  queryFn: async () => {
    const res = await adminApi.getAllOrders(filterStatus ? { status: filterStatus } : {});
    return res as { data: { data: Order[] } };
  },
});

  const orders: Order[] = data?.data?.data || [];

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      setUpdating(orderId);
      await adminApi.updateOrderStatus(orderId, status);
      toast.success("Order status updated");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilterStatus("")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!filterStatus ? "bg-rose-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-rose-300"}`}>
          All
        </button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterStatus === s ? "bg-rose-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-rose-300"}`}>
            {getOrderStatusLabel(s)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-white rounded-xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400">No orders found</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Order</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">#{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{order.items.length} item(s)</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-gray-700">{order.user?.name}</p>
                    <p className="text-xs text-gray-400">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 font-bold text-rose-700">{formatPrice(order.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updating === order.id}
                      className={`text-xs font-medium px-2.5 py-1.5 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-rose-300 disabled:opacity-60 ${getOrderStatusColor(order.status)}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{getOrderStatusLabel(s)}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
