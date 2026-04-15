// src/store/cartStore.ts

import { create } from "zustand";
import { Cart, CartItem } from "@/types";
import { cartApi } from "@/lib/api";

interface CartResponse {
  data: Cart;
}

interface CartStore {
  cart: Cart | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: null,
  isLoading: false,

  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const res = await cartApi.get();
      const data = res.data as CartResponse;
      set({ cart: data.data });
    } catch {
      set({ cart: null });
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (productId, quantity = 1) => {
    await cartApi.add(productId, quantity);
    await get().fetchCart();
  },

  updateItem: async (itemId, quantity) => {
    await cartApi.update(itemId, quantity);
    await get().fetchCart();
  },

  removeItem: async (itemId) => {
    await cartApi.remove(itemId);
    await get().fetchCart();
  },

  clearCart: async () => {
    await cartApi.clear();
    set({ cart: null });
  },

  itemCount: () => {
    const cart = get().cart;
    if (!cart) return 0;
    return cart.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
  },
}));