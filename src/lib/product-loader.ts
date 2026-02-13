import { store } from "@/constants/store";

export type Product = (typeof store)["products"][number];

export interface ProductFilterOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "price-asc" | "price-desc" | "name-asc" | "name-desc" | "newest";
  tags?: string[];
}

/**
 * Get all products with optional filtering and sorting
 */
export function getProducts(options?: ProductFilterOptions): Product[] {
  let products = [...store.products];

  // Filter by category
  if (options?.category) {
    products = products.filter((p) =>
      p.category.some((c) => c.toLowerCase() === options.category!.toLowerCase())
    );
  }

  // Filter by price range
  if (options?.minPrice !== undefined) {
    products = products.filter((p) => p.price.current >= options.minPrice!);
  }
  if (options?.maxPrice !== undefined) {
    products = products.filter((p) => p.price.current <= options.maxPrice!);
  }

  // Filter by search query
  if (options?.search) {
    const searchLower = options.search.toLowerCase();
    products = products.filter((p) =>
      p.name.toLowerCase().includes(searchLower) ||
      p.brand.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.category.some((c) => c.toLowerCase().includes(searchLower))
    );
  }

  // Filter by tags
  if (options?.tags && options.tags.length > 0) {
    products = products.filter((p) =>
      options.tags!.some((tag) =>
        p.category.some((c) => c.toLowerCase().includes(tag.toLowerCase())) ||
        p.name.toLowerCase().includes(tag.toLowerCase())
      )
    );
  }

  // Sort products
  if (options?.sortBy) {
    switch (options.sortBy) {
      case "price-asc":
        products.sort((a, b) => a.price.current - b.price.current);
        break;
      case "price-desc":
        products.sort((a, b) => b.price.current - a.price.current);
        break;
      case "name-asc":
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        products.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        // Assuming products are already in newest-first order, or reverse if needed
        products.reverse();
        break;
    }
  }

  return products;
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
