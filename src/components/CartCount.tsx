"use client";

import { useCartStore } from "@/store/cartStore";

export function CartCount() {
  const items = useCartStore((s) => s.items);
  const count = items.reduce((n, i) => n + i.quantity, 0);
  if (count === 0) return null;
  return (
    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta px-1.5 text-xs font-bold text-white">
      {count}
    </span>
  );
}
