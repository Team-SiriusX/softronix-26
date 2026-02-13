/**
 * Product API service — pure fetch functions, no React dependencies.
 * Can be used in server components, API routes, or React Query hooks.
 */

import type { ProductsResponse, Product } from "../types";

const PRODUCTS_PER_PAGE = 10;

export async function fetchProducts({
  page = 1,
  limit = PRODUCTS_PER_PAGE,
  category,
}: {
  page?: number;
  limit?: number;
  category?: string;
} = {}): Promise<ProductsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (category) params.set("category", category);

  const res = await fetch(`/api/products?${params}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchProductById(id: string): Promise<{ data: Product }> {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}
