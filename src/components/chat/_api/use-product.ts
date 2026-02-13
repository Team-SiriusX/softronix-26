import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { Product } from "@/constants/store";

export const useProduct = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const response = await client.api.products[":id"].$get({
        param: { id },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch product");
      }

      return await response.json();
    },
    enabled: enabled && !!id,
  });
};

export const useProducts = (ids: string[]) => {
  return useQuery({
    queryKey: ["products", ids],
    queryFn: async () => {
      const results = await Promise.allSettled(
        ids.map(async (id) => {
          const response = await client.api.products[":id"].$get({
            param: { id },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch product ${id}`);
          }

          const data = await response.json();
          return data.data;
        })
      );

      return results
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r as PromiseFulfilledResult<Product>).value);
    },
    enabled: ids.length > 0,
  });
};
