"use client";
// src/app/admin/page.tsx

import { useQuery } from "@tanstack/react-query";
import { Users, Package, ShoppingBag, TrendingUp } from "lucide-react";
import { adminApi } from "@/lib/api";
import { DashboardStats } from "@/types";
import { formatPrice, formatDate, getOrderStatusColor, getOrderStatusLabel } from "@/lib/utils";
import Link from "next/link";

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const res = await adminApi.getDashboard();
      return res as { data: { data: DashboardStats } };
    },
  });

  const stats: DashboardStats | undefined = data?.data?.data;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-white rounded-xl" />)}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: <Users className="text-blue-500" size={24} />, color: "bg-blue-50" },
    { label: "Total Products", value: stats?.totalProducts || 0, icon: <Package className="text-green-500" size={24} />, color: "bg-green-50" },
    { label: "Total Orders", value: stats?.totalOrders || 0, icon: <ShoppingBag className="text-purple-500" size={24} />, color: "bg-purple-50" },
    { label: "Total Revenue", value: formatPrice(stats?.totalRevenue || 0), icon: <TrendingUp className="text-rose-500" size={24} />, color: "bg-rose-50" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className={`w-11 h-11 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-rose-600 hover:text-rose-800">View all</Link>
          </div>
          {stats?.recentOrders?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {stats?.recentOrders?.map((order) => (
                <Link key={order.id} href="/admin/orders"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div>
                    <p className="text-sm font-medium text-gray-800">#{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-500">{order.user?.name} · {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`badge text-xs ${getOrderStatusColor(order.status)}`}>{getOrderStatusLabel(order.status)}</span>
                    <p className="text-sm font-bold text-rose-700 mt-1">{formatPrice(order.totalAmount)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">⚠️ Low Stock</h2>
            <Link href="/admin/products" className="text-xs text-rose-600 hover:text-rose-800">Manage</Link>
          </div>
          {stats?.lowStockProducts?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">All products have sufficient stock ✅</p>
          ) : (
            <div className="space-y-2">
              {stats?.lowStockProducts?.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-100">
                  <p className="text-sm text-gray-800 truncate max-w-[200px]">{p.name}</p>
                  <span className="badge bg-orange-100 text-orange-700 text-xs flex-shrink-0 ml-2">
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}