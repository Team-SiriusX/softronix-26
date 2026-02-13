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
            <SheetContent className="flex w-full flex-col sm:max-w-lg">
                <SheetHeader className="border-b pb-4">
                    <SheetTitle className="flex items-center gap-2 text-lg">
                        <ShoppingBag className="h-5 w-5" />
                        Your Cart
                        {itemCount > 0 && (
                            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                {itemCount} {itemCount === 1 ? "item" : "items"}
                            </span>
                        )}
                    </SheetTitle>
                </SheetHeader>

                {/* Cart items */}
                <div className="flex-1 overflow-y-auto py-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Loading cart…</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-16">
                            <div className="rounded-2xl bg-muted/50 p-6">
                                <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
                            </div>
                            <div className="text-center">
                                <p className="text-base font-semibold text-foreground">
                                    Your cart is empty
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Add products to get started
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div
                                    key={item.productId}
                                    className="flex gap-3 rounded-xl border border-border/60 bg-card p-3 transition-colors"
                                >
                                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                                        {item.product?.image ? (
                                            <Image
                                                src={item.product.image}
                                                alt={item.product.name ?? "Product"}
                                                fill
                                                sizes="80px"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Package className="h-6 w-6 text-muted-foreground/30" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-1 flex-col justify-between">
                                        <div>
                                            <p className="line-clamp-1 text-sm font-semibold text-card-foreground">
                                                {item.product?.name ?? item.productId}
                                            </p>
                                            <p className="mt-0.5 text-sm font-bold text-primary">
                                                {item.product?.formattedPrice ??
                                                    `Rs.${item.subtotal.toLocaleString()}`}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() =>
                                                        item.quantity > 1
                                                            ? updateItem(item.productId, item.quantity - 1)
                                                            : removeItem(item.productId)
                                                    }
                                                    disabled={isMutating}
                                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="flex h-7 w-8 items-center justify-center text-sm font-semibold">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateItem(item.productId, item.quantity + 1)
                                                    }
                                                    disabled={isMutating}
                                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {item.subtotal > 0 && (
                                                    <span className="text-xs font-medium text-muted-foreground">
                                                        Rs.{item.subtotal.toLocaleString()}
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => removeItem(item.productId)}
                                                    disabled={isMutating}
                                                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
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
                    <SheetFooter className="border-t pt-4">
                        <div className="w-full space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                                </span>
                                <span className="text-lg font-bold text-foreground">
                                    Rs.{total.toLocaleString()}
                                </span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={isMutating}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                            >
                                {!isAuthenticated ? (
                                    "Sign in to Checkout"
                                ) : (
                                    <>
                                        Proceed to Checkout
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
