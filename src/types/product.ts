/** Shared product types for storefront (ProductCard, AddToCartDialog, category page) */

export type ProductVariant = {
  id: string;
  size: string;
  quantity: number;
};

export type ProductForCard = {
  id: string;
  name: string;
  category: string;
  color?: string | null;
  imageUrl: string | null;
  defaultPrice: number;
  variants: ProductVariant[];
  totalStock: number;
  description?: string | null;
};
