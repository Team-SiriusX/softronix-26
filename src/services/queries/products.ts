/**
 * React Query hooks for products.
 * Consumers import these hooks — never call fetch functions directly.
 */

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import { fetchProducts, fetchProductById, type FetchProductsParams } from "../api/products";

/**
 * Infinite-scroll product list.
 * Returns flattened products, pagination helpers, and loading states.
 * Now supports comprehensive filtering and sorting.
 */
export function useProducts(filters?: Omit<FetchProductsParams, 'page' | 'limit'>) {
  return useInfiniteQuery({
    queryKey: queryKeys.products.list(filters || {}),
    queryFn: ({ pageParam }) =>
      fetchProducts({ page: pageParam, ...filters }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    staleTime: 1000 * 60 * 5, // 5 min — products rarely change
  });
}

/**
 * Single product detail.
 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => fetchProductById(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
}
