"use client";

import { Products } from "@/components/product/products";
import { CartIcon } from "@/components/cart/cartIcon";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function ProductsPage() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            {/* Header with cart actions */}
            <div className="mb-8 flex items-center justify-end gap-3">
                <Link
                    href="/cart"
                    className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                    <ShoppingCart className="h-4 w-4" />
                    View Cart
                </Link>
                <CartIcon />
            </div>

            <Products />
        </div>
    );
}
