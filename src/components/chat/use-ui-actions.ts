import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useChatContext, ProductFilters } from "@/components/providers/chat-provider";
import { useCartStore } from "@/hooks/use-cart-store";
import { dispatchAgentEvent } from "@/lib/agent-events";
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

  // navigateToPage
  page?: "home" | "products" | "cart" | "checkout" | "orders" | "profile";

  // fillCheckoutForm
  fullName?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;

  // selectAddress
  addressIndex?: number;

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

  // adjustPrice
  adjustedPrice?: number;
  formattedPrice?: string;
  increasePercentage?: number;
}

export function useUIActions() {
  const { updateFilters, clearFilters, addCoupon, addAdjustedPrice } = useChatContext();
  const router = useRouter();
  const { addItem } = useCartStore();

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
                  : sortBy === "rating"
                    ? order === "asc"
                      ? "rating-asc"
                      : "rating-desc"
                    : sortBy === "reviews"
                      ? "reviews-desc"
                      : undefined;

            if (sortValue) {
              updateFilters({ sortBy: sortValue });
              router.push("/products");
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
          router.push("/products");
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
          // Apply sort filters based on recommendation type
          // Products are shown inline in the chat as recommendation cards,
          // so we update filters for the products page and navigate there
          switch (basedOn) {
            case "trending":
              updateFilters({ sortBy: "newest" });
              break;
            case "past_activity":
              // Sort by best rated — the AI already has the user's activity context
              // and will search for products from their preferred categories
              updateFilters({ sortBy: "rating-desc" });
              break;
            case "similar":
            case "current_chat":
            default:
              break;
          }
          router.push("/products");
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
                updateFilters({ sortBy: "rating-desc" });
                toast.success("Showing best rated products");
                break;
              case "new_arrivals":
                updateFilters({ sortBy: "newest" });
                toast.success("Showing new arrivals");
                break;
            }
            router.push("/products");
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
            addItem(productId, quantity);
            toast.success(`Added ${quantity} item(s) to cart`);
          }
          break;
        }

        case "applyCoupon": {
          const {
            couponCode,
            productId,
            discountPercentage,
            originalPrice,
            discountedPrice,
            formattedOriginalPrice,
            formattedDiscountedPrice,
          } = args;
          if (couponCode && productId && discountPercentage != null && originalPrice != null && discountedPrice != null) {
            // Store the coupon in our context so cart/checkout can use it
            addCoupon({
              couponCode: couponCode as string,
              productId: productId as string,
              discountPercentage: discountPercentage as number,
              originalPrice: originalPrice as number,
              discountedPrice: discountedPrice as number,
              formattedOriginalPrice: (formattedOriginalPrice as string) ?? `Rs.${(originalPrice as number).toLocaleString()}`,
              formattedDiscountedPrice: (formattedDiscountedPrice as string) ?? `Rs.${(discountedPrice as number).toLocaleString()}`,
            });
            toast.success(
              `Coupon ${couponCode} applied! ${discountPercentage}% off — New price: ${formattedDiscountedPrice}`,
              { duration: 6000 }
            );
          }
          break;
        }

        case "navigateToPage": {
          const { page } = args;
          if (page) {
            const pageMap: Record<string, string> = {
              home: "/",
              products: "/products",
              cart: "/cart",
              checkout: "/checkout",
              orders: "/orders",
              profile: "/profile",
            };
            const path = pageMap[page];
            if (path) {
              router.push(path);
              toast.success(`Navigating to ${page}`);
            }
          }
          break;
        }

        case "fillCheckoutForm": {
          const { fullName, phone, line1, line2, city, state, postalCode } = args;
          if (fullName && phone && line1 && city && postalCode) {
            dispatchAgentEvent("agent:fillAddress", {
              fullName,
              phone,
              line1,
              line2: line2 || "",
              city,
              state: state || "",
              postalCode,
            });
            toast.success("Filling address form...");
          }
          break;
        }

        case "selectAddress": {
          const { addressIndex } = args;
          if (addressIndex !== undefined && addressIndex >= 1) {
            dispatchAgentEvent("agent:selectAddress", { addressIndex });
            toast.success(`Selecting address #${addressIndex}`);
          }
          break;
        }

        case "proceedToPayment": {
          dispatchAgentEvent("agent:proceedToPayment", {});
          toast.success("Proceeding to payment...");
          break;
        }

        case "submitAddress": {
          dispatchAgentEvent("agent:submitAddress", {});
          toast.success("Saving address...");
          break;
        }

        case "adjustPrice": {
          const { productId } = args;
          const adjustedPrice = args.adjustedPrice as number | undefined;
          const formattedPrice = args.formattedPrice as string | undefined;
          const increasePercentage = args.increasePercentage as number | undefined;
          if (productId && adjustedPrice != null && increasePercentage != null) {
            addAdjustedPrice({
              productId: productId as string,
              adjustedPrice,
              formattedPrice: formattedPrice ?? `Rs.${adjustedPrice.toLocaleString()}`,
              increasePercentage,
            });
            // Toast is handled by the chat widget to avoid spam on bulk adjustments
          }
          break;
        }

        default:
          console.warn(`Unknown UI action: ${action}`);
      }
    },
    [updateFilters, clearFilters, router, addItem, addCoupon, addAdjustedPrice]
  );

  return { executeUIAction };
}
