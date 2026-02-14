"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { useCartStore } from "@/hooks/use-cart-store";
import { useSession } from "@/lib/auth-client";
import {
    Minus,
    Plus,
    Trash2,
    ShoppingBag,
    Loader2,
    Package,
    ArrowRight,
} from "lucide-react";

type CartSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
    const {
        items,
        itemCount,
        total,
        updateItem,
        removeItem,
        isLoading,
        isMutating,
    } = useCartStore();
    const session = useSession();
    const isAuthenticated = !!session.data?.user;
    const router = useRouter();

    const handleCheckout = () => {
        if (!isAuthenticated) {
            alert("Please sign in to checkout.");
            return;
        }
        onOpenChange(false);
        router.push("/checkout");
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex w-full flex-col bg-[#f2efe9] sm:max-w-lg">
                <SheetHeader className="border-b border-[#1c1c1c]/10 pb-4">
                    <SheetTitle className="flex items-center gap-2 font-gloock text-xl text-[#1c1c1c]">
                        <ShoppingBag className="h-5 w-5" />
                        Your Cart
                        {itemCount > 0 && (
                            <span className="bg-[#1c1c1c] px-2.5 py-0.5 text-xs font-medium tracking-widest text-[#f2efe9]">
                                {itemCount}
                            </span>
                        )}
                    </SheetTitle>
                </SheetHeader>

                {/* Cart items */}
                <div className="flex-1 overflow-y-auto py-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-[#1c1c1c]" />
                            <p className="text-sm text-[#5c5c5c]">Loading cart…</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-16">
                            <ShoppingBag className="h-16 w-16 text-[#1c1c1c]/20" />
                            <div className="text-center">
                                <p className="font-gloock text-lg text-[#1c1c1c]">
                                    Your cart is empty
                                </p>
                                <p className="mt-1 text-sm text-[#5c5c5c]">
                                    Add products to get started
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div
                                    key={item.productId}
                                    className="flex gap-4 border-b border-[#1c1c1c]/10 pb-4"
                                >
                                    <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-[#e8e5df]">
                                        {item.product?.image ? (
                                            <Image
                                                src={item.product.image}
                                                alt={item.product.name ?? "Product"}
                                                fill
                                                sizes="96px"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Package className="h-8 w-8 text-[#1c1c1c]/20" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-1 flex-col justify-between">
                                        <div>
                                            <h3 className="line-clamp-2 font-gloock text-sm text-[#1c1c1c]">
                                                {item.product?.name ?? item.productId}
                                            </h3>
                                            <p className="mt-1 text-sm font-medium text-[#1c1c1c]">
                                                {item.product?.formattedPrice ??
                                                    `Rs.${item.subtotal.toLocaleString()}`}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 border border-[#1c1c1c]/20">
                                                <button
                                                    onClick={() =>
                                                        item.quantity > 1
                                                            ? updateItem(item.productId, item.quantity - 1)
                                                            : removeItem(item.productId)
                                                    }
                                                    disabled={isMutating}
                                                    className="flex h-8 w-8 items-center justify-center bg-transparent text-[#1c1c1c] transition-colors hover:bg-[#1c1c1c] hover:text-[#f2efe9] disabled:opacity-40"
                                                >
                                                    <Minus className="h-3.5 w-3.5" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-medium text-[#1c1c1c]">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateItem(item.productId, item.quantity + 1)
                                                    }
                                                    disabled={isMutating}
                                                    className="flex h-8 w-8 items-center justify-center bg-transparent text-[#1c1c1c] transition-colors hover:bg-[#1c1c1c] hover:text-[#f2efe9] disabled:opacity-40"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {item.subtotal > 0 && (
                                                    <span className="text-xs font-semibold text-[#1c1c1c]">
                                                        Rs.{item.subtotal.toLocaleString()}
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => removeItem(item.productId)}
                                                    disabled={isMutating}
                                                    className="flex h-8 w-8 items-center justify-center text-[#5c5c5c] transition-colors hover:text-[#1c1c1c] disabled:opacity-40"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <SheetFooter className="border-t border-[#1c1c1c]/10 pt-4">
                        <div className="w-full space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[#5c5c5c]">
                                    Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                                </span>
                                <span className="font-gloock text-xl text-[#1c1c1c]">
                                    Rs.{total.toLocaleString()}
                                </span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={isMutating}
                                className="flex w-full items-center justify-center gap-2 border border-[#1c1c1c] bg-[#1c1c1c] px-6 py-3 text-sm font-medium uppercase tracking-widest text-[#f2efe9] transition-all hover:bg-transparent hover:text-[#1c1c1c] disabled:pointer-events-none disabled:opacity-50"
                            >
                                {!isAuthenticated ? (
                                    "Sign in to Checkout"
                                ) : (
                                    <>
                                        Checkout
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}
