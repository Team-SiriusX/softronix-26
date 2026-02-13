/**
 * Shared types for the e-commerce frontend.
 * These mirror the API response shapes.
 */

// ─── Product ───────────────────────────────────────────────

export type Product = {
  id: string;
  name: string;
  brand: string;
  price: {
    current: number;
    original?: number;
    currency: string;
    formatted: string;
    discount_percentage?: number;
  };
  category: string[];
  images: string[];
  stock_status: string;
  reviews: {
    count: number;
    average_rating: number | null;
    summary: string;
  };
  description: string;
};

export type ProductsResponse = {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  nextPage: number | null;
  categories: string[];
};

// ─── Cart ──────────────────────────────────────────────────

export type CartItemEnriched = {
  id: string;
  productId: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    image: string | null;
    formattedPrice: string;
  } | null;
  subtotal: number;
};

export type CartResponse = {
  data: {
    id: string;
    items: CartItemEnriched[];
    itemCount: number;
    total: number;
  };
};

export type AddToCartRequest = {
  productId: string;
  quantity: number;
};

export type UpdateCartRequest = {
  productId: string;
  quantity: number;
};

export type RemoveFromCartRequest = {
  productId: string;
};

export type CartMutationResponse = {
  data?: unknown;
  message: string;
  error?: string;
};

// ─── Local Cart (guest) ────────────────────────────────────

export type LocalCartItem = {
  productId: string;
  quantity: number;
};

export type SyncCartRequest = {
  items: LocalCartItem[];
};

// ─── Order ─────────────────────────────────────────────────

export type OrderItem = {
  id: string;
  productId: string;
  priceSnapshot: number;
  quantity: number;
  product?: {
    name: string;
    price: number;
    image: string | null;
    category?: string[];
  } | null;
};

export type Order = {
  id: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  createdAt: string;
  updatedAt?: string;
  itemCount?: number;
  items: OrderItem[];
};

export type OrdersResponse = {
  data: Order[];
  total: number;
};

export type CheckoutResponse = {
  data: Order;
  message: string;
};
