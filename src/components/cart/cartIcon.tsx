"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/hooks/use-cart-store";
import { useState } from "react";
import { CartSheet } from "./cart";

export function CartIcon() {
    const { itemCount } = useCartStore();
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="relative flex items-center justify-center rounded-xl p-2 transition-colors hover:bg-muted"
                aria-label="Open cart"
            >
                <ShoppingBag className="h-5 w-5 text-foreground" />
                {itemCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-sm">
                        {itemCount > 99 ? "99+" : itemCount}
                    </span>
                )}
            </button>
            <CartSheet open={open} onOpenChange={setOpen} />
        </>
    );
}
