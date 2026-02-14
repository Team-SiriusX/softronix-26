"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { store } from "@/constants/store";
import { useCartStore } from "@/hooks/use-cart-store";
import { useSession } from "@/lib/auth-client";
import {
  ArrowLeft,
  ShoppingCart,
  CheckCircle,
  Package,
  Loader2,
  Zap,
  TrendingUp,
} from "lucide-react";
import { useChatContext } from "@/components/providers/chat-provider";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const product = store.products.find((p) => p.id === productId);
  
  const { addItem, isInCart, isMutating, mutatingProductId } = useCartStore();
  const session = useSession();
  const isAuthenticated = !!session.data?.user;
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { getAdjustedPrice } = useChatContext();
  const adjustment = product ? getAdjustedPrice(product.id) : undefined;

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f2efe9] selection:bg-[#1c1c1c] selection:text-[#f2efe9]">
        <div className="mx-auto max-w-[100rem] px-6 py-32 text-center md:px-12 lg:px-24">
          <Package className="mx-auto h-20 w-20 text-[#1c1c1c]/20" />
          <h1 className="mt-6 font-gloock text-3xl text-[#1c1c1c]">
            Product Not Found
          </h1>
          <Link
            href="/products"
            className="mt-8 inline-flex items-center gap-2 border border-[#1c1c1c] bg-transparent px-6 py-3 text-sm font-medium uppercase tracking-widest text-[#1c1c1c] transition-all hover:bg-[#1c1c1c] hover:text-[#f2efe9]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const isAddedToCart = isInCart(product.id);
  const isProcessing = isMutating && mutatingProductId === product.id;

  const handleAddToCart = () => {
    addItem(product.id, quantity);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      alert("Please sign in to checkout.");
      return;
    }
    addItem(product.id, quantity);
    setTimeout(() => {
      router.push("/checkout");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#f2efe9] selection:bg-[#1c1c1c] selection:text-[#f2efe9]">
      {/* Header */}
      <div className="border-b border-[#1c1c1c]/10 bg-[#f2efe9]">
        <div className="mx-auto max-w-[100rem] px-6 py-6 md:px-12 lg:px-24">
          <Link
            href="/products"
            className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-[#1c1c1c] transition-opacity hover:opacity-60"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </div>
      </div>

      {/* Product Details */}
      <div className="mx-auto max-w-[100rem] px-6 py-12 md:px-12 lg:px-24">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left: Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square w-full overflow-hidden bg-[#e8e5df]">
              {product.images?.[selectedImage] ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-24 w-24 text-[#1c1c1c]/20" />
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square overflow-hidden bg-[#e8e5df] transition-opacity ${
                      selectedImage === index
                        ? "border-2 border-[#1c1c1c]"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="flex flex-col space-y-6">
            {/* Category */}
            {product.category && product.category.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.category.map((cat) => (
                  <span
                    key={cat}
                    className="bg-[#1c1c1c]/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-[#1c1c1c]"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="font-gloock text-4xl tracking-tight text-[#1c1c1c] md:text-5xl">
              {product.name}
            </h1>

            {/* Brand */}
            {product.brand && (
              <p className="text-sm uppercase tracking-widest text-[#5c5c5c]">
                {product.brand}
              </p>
            )}

            {/* Reviews */}
            {product.reviews.average_rating && product.reviews.count && (
              <div className="flex items-center gap-2 text-sm text-[#5c5c5c]">
                <span className="text-lg">★</span>
                <span className="font-medium text-[#1c1c1c]">
                  {product.reviews.average_rating}
                </span>
                <span>({product.reviews.count} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="border-y border-[#1c1c1c]/10 py-6">
              {adjustment ? (
                <div className="flex items-baseline gap-3">
                  <span className="font-gloock text-3xl text-red-600">
                    {adjustment.formattedPrice}
                  </span>
                  <span className="text-xl text-[#5c5c5c] line-through">
                    {product.price.currency} {product.price.current}
                  </span>
                  <span className="flex items-center gap-1 rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-600">
                    <TrendingUp className="h-3.5 w-3.5" />
                    +{adjustment.increasePercentage}% Price Increase
                  </span>
                </div>
              ) : (
                <div className="flex items-baseline gap-3">
                  <span className="font-gloock text-3xl text-[#1c1c1c]">
                    {product.price.currency} {product.price.current}
                  </span>
                  {product.price.original && (
                    <>
                      <span className="text-xl text-[#5c5c5c] line-through">
                        {product.price.currency} {product.price.original}
                      </span>
                      {product.price.discount_percentage && (
                        <span className="bg-[#1c1c1c] px-2 py-1 text-xs font-bold uppercase tracking-widest text-[#f2efe9]">
                          -{product.price.discount_percentage}% OFF
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock_status === "in_stock" ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    In Stock
                  </span>
                </>
              ) : (
                <>
                  <Package className="h-5 w-5 text-[#5c5c5c]" />
                  <span className="text-sm font-medium text-[#5c5c5c]">
                    Out of Stock
                  </span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock_status === "in_stock" && (
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-widest text-[#1c1c1c]">
                  Quantity
                </label>
                <div className="flex items-center gap-3 border border-[#1c1c1c]/20 w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-12 w-12 items-center justify-center bg-transparent text-[#1c1c1c] transition-colors hover:bg-[#1c1c1c] hover:text-[#f2efe9]"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-medium text-[#1c1c1c]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-12 w-12 items-center justify-center bg-transparent text-[#1c1c1c] transition-colors hover:bg-[#1c1c1c] hover:text-[#f2efe9]"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              {isAddedToCart ? (
                <div className="flex w-full items-center justify-center gap-2 border border-[#1c1c1c]/20 bg-[#1c1c1c]/5 px-6 py-4 text-sm font-medium uppercase tracking-widest text-[#1c1c1c]">
                  <CheckCircle className="h-5 w-5" />
                  Added to Cart
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={
                    product.stock_status !== "in_stock" || isProcessing
                  }
                  className="flex w-full items-center justify-center gap-2 border border-[#1c1c1c] bg-transparent px-6 py-4 text-sm font-medium uppercase tracking-widest text-[#1c1c1c] transition-all hover:bg-[#1c1c1c] hover:text-[#f2efe9] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </>
                  )}
                </button>
              )}

              <button
                onClick={handleBuyNow}
                disabled={product.stock_status !== "in_stock" || isProcessing}
                className="flex w-full items-center justify-center gap-2 border border-[#1c1c1c] bg-[#1c1c1c] px-6 py-4 text-sm font-medium uppercase tracking-widest text-[#f2efe9] transition-all hover:bg-transparent hover:text-[#1c1c1c] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Zap className="h-5 w-5" />
                Buy Now
              </button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="border-t border-[#1c1c1c]/10 pt-6">
                <h2 className="mb-4 font-gloock text-xl text-[#1c1c1c]">
                  Description
                </h2>
                <p className="text-[#5c5c5c] leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Key Features */}
            {product.key_features && product.key_features.length > 0 && (
              <div className="border-t border-[#1c1c1c]/10 pt-6">
                <h2 className="mb-4 font-gloock text-xl text-[#1c1c1c]">
                  Key Features
                </h2>
                <ul className="space-y-2">
                  {product.key_features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-[#5c5c5c]"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 bg-[#1c1c1c]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* How to Use */}
            {product.how_to_use && product.how_to_use.length > 0 && (
              <div className="border-t border-[#1c1c1c]/10 pt-6">
                <h2 className="mb-4 font-gloock text-xl text-[#1c1c1c]">
                  How to Use
                </h2>
                <ol className="space-y-2">
                  {product.how_to_use.map((step, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-[#5c5c5c]"
                    >
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center border border-[#1c1c1c]/20 text-xs font-medium text-[#1c1c1c]">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="border-t border-[#1c1c1c]/10 pt-6">
                <h2 className="mb-4 font-gloock text-xl text-[#1c1c1c]">
                  Ingredients
                </h2>
                <p className="text-sm text-[#5c5c5c] leading-relaxed">
                  {product.ingredients.join(", ")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
