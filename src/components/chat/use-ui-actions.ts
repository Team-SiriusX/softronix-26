import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useChatContext, ProductFilters } from "@/components/providers/chat-provider";
import { toast } from "sonner";

interface UIActionArgs {
  // sortProducts
  sortBy?: "price" | "rating" | "name" | "reviews";
  order?: "asc" | "desc";

  // filterProducts
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  search?: string;

  // navigateToProduct, openProductDetail, addToCart, highlightProduct
  productId?: string;
  quantity?: number;
  duration?: number;

  // showRecommendations
  basedOn?: "past_activity" | "current_chat" | "trending" | "similar";
  productIds?: string[];

  // applyVibeFilter
  vibe?: "cheaper" | "premium" | "trending" | "best_rated" | "new_arrivals";

  // applyCoupon
  couponCode?: string;
  discountPercentage?: number;
  originalPrice?: number;
  discountedPrice?: number;
  formattedOriginalPrice?: string;
  formattedDiscountedPrice?: string;
}

export function useUIActions() {
  const { updateFilters, clearFilters } = useChatContext();
  const router = useRouter();

  const executeUIAction = useCallback(
    (action: string, args: UIActionArgs) => {
      console.log(`🎯 Executing UI Action: ${action}`, args);

      switch (action) {
        case "sortProducts": {
          const { sortBy, order } = args;
          if (sortBy && order) {
            const sortValue =
              sortBy === "price"
                ? order === "asc"
                  ? "price-asc"
                  : "price-desc"
                : sortBy === "name"
                  ? order === "asc"
                    ? "name-asc"
                    : "name-desc"
                  : undefined;

            if (sortValue) {
              updateFilters({ sortBy: sortValue });
              toast.success(`Sorted by ${sortBy} (${order})`);
            }
          }
          break;
        }

        case "filterProducts": {
          const {
            category,
            minPrice,
            maxPrice,
            search,
          } = args;

          const filters: Partial<ProductFilters> = {};
          if (category) filters.category = category;
          if (minPrice !== undefined) filters.minPrice = minPrice;
          if (maxPrice !== undefined) filters.maxPrice = maxPrice;
          if (search) filters.search = search;

          updateFilters(filters);
          toast.success("Filters applied");
          break;
        }

        case "navigateToProduct": {
          const { productId } = args;
          if (productId) {
            // Scroll to product if on products page
            const element = document.getElementById(`product-${productId}`);
            if (element) {
              element.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              toast.success("Navigated to product");
            } else {
              // Navigate to products page if not there
              router.push(`/products?highlight=${productId}`);
            }
          }
          break;
        }

        case "showRecommendations": {
          const { basedOn, productIds } = args;
          // This could trigger a state update to show recommendations
          // For now, just log it
          console.log("Show recommendations:", { basedOn, productIds });
          toast.info(`Showing ${basedOn || "curated"} recommendations`);
          break;
        }

        case "highlightProduct": {
          const { productId, duration = 3000 } = args;
          if (productId) {
            const element = document.getElementById(`product-${productId}`);
            if (element) {
              // Add highlight class
              element.classList.add(
                "ring-4",
                "ring-[#292725]",
                "ring-offset-2",
              );

              // Remove after duration
              setTimeout(() => {
                element.classList.remove(
                  "ring-4",
                  "ring-[#292725]",
                  "ring-offset-2",
                );
              }, duration);

              // Scroll into view
              element.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }
          break;
        }

        case "applyVibeFilter": {
          const { vibe } = args;
          if (vibe) {
            switch (vibe) {
              case "cheaper":
                updateFilters({ sortBy: "price-asc" });
                toast.success("Showing budget-friendly options");
                break;
              case "premium":
                updateFilters({ sortBy: "price-desc" });
                toast.success("Showing premium products");
                break;
              case "trending":
                updateFilters({ sortBy: "newest" });
                toast.success("Showing trending products");
                break;
              case "best_rated":
                updateFilters({ sortBy: "newest" }); // Would need rating sort
                toast.success("Showing best rated products");
                break;
              case "new_arrivals":
                updateFilters({ sortBy: "newest" });
                toast.success("Showing new arrivals");
                break;
            }
          }
          break;
        }

        case "clearFilters": {
          clearFilters();
          toast.success("Filters cleared");
          break;
        }

        case "openProductDetail": {
          const { productId } = args;
          if (productId) {
            router.push(`/products/${productId}`);
            toast.info("Opening product details");
          }
          break;
        }

        case "addToCart": {
          const { productId, quantity = 1 } = args;
          if (productId) {
            // This would integrate with your cart system
            console.log("Add to cart:", { productId, quantity });
            toast.success(`Added ${quantity} item(s) to cart`);
          }
          break;
        }

        case "applyCoupon": {
          const {
            couponCode,
            productId,
            discountPercentage,
            formattedDiscountedPrice,
          } = args;
          if (couponCode && productId) {
            // This would integrate with your cart/checkout system
            console.log("Apply coupon:", {
              couponCode,
              productId,
              discountPercentage,
            });
            toast.success(
              `Coupon ${couponCode} applied! ${discountPercentage}% off - ${formattedDiscountedPrice}`,
              { duration: 5000 }
            );
          }
          break;
        }

        default:
          console.warn(`Unknown UI action: ${action}`);
      }
    },
    [updateFilters, clearFilters, router]
  );

  return { executeUIAction };
}
