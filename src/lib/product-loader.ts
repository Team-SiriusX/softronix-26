import { store } from "@/constants/store";

export type Product = (typeof store)["products"][number];

/**
 * Get all products, optionally filtered by category
 */
export function getProducts(category?: string): Product[] {
  if (!category) return store.products;

  return store.products.filter((p) =>
    p.category.some((c) => c.toLowerCase() === category.toLowerCase())
  );
}

/**
 * Get a single product by its ID
 */
export function getProductById(id: string): Product | undefined {
  return store.products.find((p) => p.id === id);
}

/**
 * Get store metadata
 */
export function getStoreInfo() {
  return store.store_info;
}

/**
 * Get all available categories
 */
export function getCategories(): string[] {
  return store.product_categories;
}
