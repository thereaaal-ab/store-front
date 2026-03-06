import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/constants";

export type CartItem = {
  productId: string;
  variantId?: string;
  quantity: number;
  priceAtTime: number;
  name: string;
  imageUrl?: string;
  size?: string;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  removeItem: (productId: string, variantId: string | undefined) => void;
  clearCart: () => void;
  getTotal: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { productId, variantId, quantity = 1, ...rest } = item;
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === productId && (i.variantId ?? undefined) === (variantId ?? undefined)
          );
          const next = existing
            ? state.items.map((i) =>
                i.productId === productId && (i.variantId ?? undefined) === (variantId ?? undefined)
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              )
            : [...state.items, { productId, variantId, quantity, ...rest }];
          return { items: next };
        });
      },

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && (i.variantId ?? undefined) === (variantId ?? undefined)
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && (i.variantId ?? undefined) === (variantId ?? undefined))
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((sum, i) => sum + i.priceAtTime * i.quantity, 0);
      },
    }),
    { name: STORAGE_KEYS.CART }
  )
);
