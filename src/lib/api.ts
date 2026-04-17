// src/lib/api.ts
import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://s-redrose-1.onrender.com";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  // ❌ Origin header manually set করা যাবে না — browser block করে
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Products ──────────────────────────────────────────────────
export const productApi = {
  getAll: (params?: Record<string, string>) => api.get("/products", { params }),
  getBySlug: (slug: string) => api.get(`/products/${slug}`),
};

// ── Categories ────────────────────────────────────────────────
export const categoryApi = {
  getAll: () => api.get("/categories"),
};

// ── Cart ──────────────────────────────────────────────────────
export const cartApi = {
  get: () => api.get("/cart"),
  add: (productId: string, quantity: number) =>
    api.post("/cart", { productId, quantity }),
  update: (itemId: string, quantity: number) =>
    api.put(`/cart/item/${itemId}`, { quantity }),
  remove: (itemId: string) => api.delete(`/cart/item/${itemId}`),
  clear: () => api.delete("/cart"),
};

// ── Orders ────────────────────────────────────────────────────
export const orderApi = {
  create: (data: {
    items: { productId: string; quantity: number }[];
    address: string;
    city: string;
    postalCode?: string;
    phone: string;
    note?: string;
  }) => api.post("/orders", data),
  getMy: () => api.get("/orders/my"),
  getById: (id: string) => api.get(`/orders/${id}`),
  cancel: (id: string) => api.patch(`/orders/${id}/cancel`),
};

// ── Reviews ───────────────────────────────────────────────────
export const reviewApi = {
  add: (data: { productId: string; rating: number; comment?: string }) =>
    api.post("/reviews", data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
};

// ── User ──────────────────────────────────────────────────────
export const userApi = {
  getProfile: () => api.get("/user/profile"),
  updateProfile: (data: FormData) =>
    api.put("/user/profile", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ── Admin ─────────────────────────────────────────────────────
export const adminApi = {
  getDashboard: () => api.get("/admin/dashboard"),
  createProduct: (data: FormData) =>
    api.post("/admin/products", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateProduct: (id: string, data: FormData) =>
    api.put(`/admin/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
  createCategory: (data: FormData) =>
    api.post("/admin/categories", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateCategory: (id: string, data: FormData) =>
    api.put(`/admin/categories/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),
  getAllOrders: (params?: Record<string, string>) =>
    api.get("/admin/orders", { params }),
  updateOrderStatus: (id: string, status: string) =>
    api.put(`/admin/orders/${id}/status`, { status }),
  getAllUsers: (params?: Record<string, string>) =>
    api.get("/admin/users", { params }),
  changeRole: (id: string, role: string) =>
    api.put(`/admin/users/${id}/role`, { role }),
};

// ── Image URL ─────────────────────────────────────────────────
export const getImageUrl = (filename: string | null | undefined): string => {
  if (!filename) return "/placeholder.jpg";
  if (filename.startsWith("http")) return filename;
  return `${API_URL}/uploads/${filename}`;
};
