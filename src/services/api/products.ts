/**
 * Product API service — pure fetch functions, no React dependencies.
 * Can be used in server components, API routes, or React Query hooks.
 */

import type { ProductsResponse, Product } from "../types";

const PRODUCTS_PER_PAGE = 10;

export interface FetchProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "price-asc" | "price-desc" | "name-asc" | "name-desc" | "newest" | "rating-desc" | "rating-asc" | "reviews-desc";
  tags?: string[];
}

export async function fetchProducts({
  page = 1,
  limit = PRODUCTS_PER_PAGE,
  category,
  minPrice,
  maxPrice,
  search,
  sortBy,
  tags,
}: FetchProductsParams = {}): Promise<ProductsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  
  if (category) params.set("category", category);
  if (minPrice !== undefined) params.set("minPrice", String(minPrice));
  if (maxPrice !== undefined) params.set("maxPrice", String(maxPrice));
  if (search) params.set("search", search);
  if (sortBy) params.set("sortBy", sortBy);
  if (tags && tags.length > 0) params.set("tags", tags.join(","));

  const res = await fetch(`/api/products?${params}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchProductById(id: string): Promise<{ data: Product }> {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}
