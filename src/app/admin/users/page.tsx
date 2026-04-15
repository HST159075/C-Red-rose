"use client";
// src/app/admin/users/page.tsx

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { User } from "@/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";

type UserWithCount = User & { _count?: { orders: number } };

interface UsersResponse {
  data: UserWithCount[];
  pagination?: { page: number; total: number; totalPages: number };
}

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [updating, setUpdating] = useState<string | null>(null);

  const { data, isLoading } = useQuery<UsersResponse>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await adminApi.getAllUsers();
      return response.data as UsersResponse;
    },
  });

  const users: UserWithCount[] = data?.data || [];

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      setUpdating(userId);
      await adminApi.changeRole(userId, role);
      toast.success(`Role changed to ${role}`);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch {
      toast.error("Failed to change role");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">
        Users{" "}
        <span className="text-lg text-gray-400 font-normal">({users.length})</span>
      </h1>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-white rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Joined</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Orders</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-sm flex-shrink-0">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="badge bg-gray-100 text-gray-600 text-xs">
                      {user._count?.orders || 0} orders
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={updating === user.id}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-rose-300 disabled:opacity-60 ${
                        user.role === "ADMIN" ? "bg-rose-100 text-rose-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <option value="USER">👤 User</option>
                      <option value="ADMIN">👑 Admin</option>
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