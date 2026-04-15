// src/types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: "USER" | "ADMIN";
  emailVerified: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  createdAt: string;
  _count?: { products: number };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  regularPrice: number;
  salePrice: number | null;
  mainImg: string;
  hoverImg: string | null;
  stock: number;
  isActive: boolean;
  categoryId: string | null;
  category?: Category;
  reviews?: Review[];
  avgRating?: number | null;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    mainImg: string;
    regularPrice: number;
    salePrice: number | null;
    stock: number;
  };
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    mainImg: string;
    slug?: string;
  };
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: "CASH_ON_DELIVERY";
  paymentStatus: "UNPAID" | "PAID" | "REFUNDED";
  address: string;
  city: string;
  postalCode: string | null;
  phone: string;
  note: string | null;
  items: OrderItem[];
  user?: { name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string; image: string | null };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit?: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
  lowStockProducts: { id: string; name: string; stock: number }[];
}
