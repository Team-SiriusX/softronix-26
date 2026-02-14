import { ProductFilterPanel } from "@/components/product/product-filter-panel";
import { Products } from "@/components/product/products";
import { CartIcon } from "@/components/cart/cartIcon";
import Link from "next/link";
import { ShoppingCart, ArrowLeft } from "lucide-react";

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-[#f2efe9] selection:bg-[#1c1c1c] selection:text-[#f2efe9]">
      {/* Header */}
      <div className="border-b border-[#1c1c1c]/10 bg-[#f2efe9]">
        <div className="mx-auto max-w-[120rem] px-6 py-6 md:px-12 lg:px-24">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-[#1c1c1c] transition-opacity hover:opacity-60"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/cart"
                className="flex items-center gap-2 border border-[#1c1c1c]/20 px-4 py-2 text-xs font-medium uppercase tracking-widest text-[#1c1c1c] transition-all hover:bg-[#1c1c1c] hover:text-[#f2efe9]"
              >
                <ShoppingCart className="h-4 w-4" />
                Cart
              </Link>
              <CartIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-[120rem] px-6 py-12 md:px-12 lg:px-24">
        <div className="flex gap-12">
          {/* Sidebar */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <ProductFilterPanel />
          </aside>
          
          {/* Products */}
          <main className="flex-1">
            <Products />
          </main>
        </div>
      </div>
    </div>
  );
}
