"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/hooks/use-cart-store";
import { useSession } from "@/lib/auth-client";
import { queryKeys } from "@/services/query-keys";
import {
    useAddresses,
    useCreateAddress,
    useInitCheckout,
} from "@/services/queries/checkout";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import {
    ArrowLeft,
    Loader2,
    MapPin,
    PlusCircle,
    ChevronRight,
    ShieldCheck,
    ShoppingBag,
    Lock,
} from "lucide-react";
import Link from "next/link";

type Step = "address" | "payment";

export default function CheckoutPage() {
    const router = useRouter();
    const session = useSession();
    const isAuthenticated = !!session.data?.user;
    const queryClient = useQueryClient();

    const { items, itemCount, total, isLoading: cartLoading } = useCartStore();

    // ─── Checkout state ──────────────────────────────────────
    const [step, setStep] = useState<Step>("address");
    const [paymentData, setPaymentData] = useState<{
        clientSecret: string;
        orderId: string;
        total: number;
    } | null>(null);

    // ─── Address state ───────────────────────────────────────
    const addressQuery = useAddresses();
    const createAddressMutation = useCreateAddress();
    const initCheckoutMutation = useInitCheckout();
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressForm, setAddressForm] = useState({
        fullName: "",
        phone: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
    });

    // ─── Handlers ────────────────────────────────────────────
    const handleCreateAddress = () => {
        createAddressMutation.mutate(
            { ...addressForm, country: "PK" },
            {
                onSuccess: (data) => {
                    setSelectedAddressId(data.data.id);
                    setShowAddressForm(false);
                    setAddressForm({
                        fullName: "",
                        phone: "",
                        line1: "",
                        line2: "",
                        city: "",
                        state: "",
                        postalCode: "",
                    });
                },
            }
        );
    };

    const handleProceedToPayment = () => {
        if (!selectedAddressId) return;

        initCheckoutMutation.mutate(selectedAddressId, {
            onSuccess: (data) => {
                setPaymentData({
                    clientSecret: data.clientSecret,
                    orderId: data.orderId,
                    total: data.totalAmount,
                });
                setStep("payment");
            },
        });
    };

    const handlePaymentSuccess = () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
        // Redirect to orders after a brief delay so success animation shows
        setTimeout(() => {
            router.push("/orders?payment=success");
        }, 2500);
    };

    // ─── Guard: not signed in ────────────────────────────────
    if (!isAuthenticated) {
        return (
            <div className="mx-auto flex max-w-lg flex-col items-center gap-5 px-4 py-24 text-center">
                <div className="rounded-2xl bg-muted/50 p-5">
                    <Lock className="h-12 w-12 text-muted-foreground/40" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Sign in to continue</h2>
                <p className="text-sm text-muted-foreground">
                    You need to be signed in to complete your purchase.
                </p>
                <Link
                    href="/auth/sign-in"
                    className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
                >
                    Sign In
                </Link>
            </div>
        );
    }

    // ─── Guard: empty cart ───────────────────────────────────
    if (!cartLoading && items.length === 0 && step === "address") {
        return (
            <div className="mx-auto flex max-w-lg flex-col items-center gap-5 px-4 py-24 text-center">
                <div className="rounded-2xl bg-muted/50 p-5">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Your cart is empty</h2>
                <p className="text-sm text-muted-foreground">
                    Add items to your cart before checking out.
                </p>
                <Link
                    href="/products"
                    className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
                >
                    Browse Products
                </Link>
            </div>
        );
    }

    // ─── Step indicator ──────────────────────────────────────
    const StepIndicator = () => (
        <div className="mb-8 flex items-center justify-center gap-3">
            <div
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${step === "address"
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary"
                    }`}
            >
                <MapPin className="h-3.5 w-3.5" />
                Address
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${step === "payment"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
            >
                <ShieldCheck className="h-3.5 w-3.5" />
                Payment
            </div>
        </div>
    );

    // ─── Payment step ────────────────────────────────────────
    if (step === "payment" && paymentData) {
        return (
            <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
                <StepIndicator />
                <div className="mb-6">
                    <button
                        onClick={() => setStep("address")}
                        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to address
                    </button>
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                        Payment
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Order #{paymentData.orderId.slice(0, 8)}… •{" "}
                        <span className="font-semibold text-foreground">
                            Rs.{paymentData.total.toLocaleString()}
                        </span>
                    </p>
                </div>
                <CheckoutForm
                    clientSecret={paymentData.clientSecret}
                    orderId={paymentData.orderId}
                    totalAmount={paymentData.total}
                    onSuccess={handlePaymentSuccess}
                    onCancel={() => setStep("address")}
                />
            </div>
        );
    }

    // ─── Address step ────────────────────────────────────────
    const addresses = addressQuery.data?.data ?? [];

    return (
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
            <StepIndicator />

            <div className="mb-8 flex items-center gap-4">
                <Link
                    href="/cart"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border transition-colors hover:bg-muted"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                        Shipping Address
                    </h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        Where should we deliver your order?
                    </p>
                </div>
            </div>

            {/* Order summary mini */}
            <div className="mb-6 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                <span className="text-sm text-muted-foreground">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
                <span className="text-base font-bold text-foreground">
                    Rs.{total.toLocaleString()}
                </span>
            </div>

            {/* Saved addresses */}
            <div className="space-y-3">
                {addressQuery.isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    addresses.map((addr) => (
                        <button
                            key={addr.id}
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`w-full rounded-xl border p-4 text-left transition-all ${selectedAddressId === addr.id
                                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                    : "border-border hover:border-primary/40 hover:bg-muted/30"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${selectedAddressId === addr.id
                                            ? "border-primary bg-primary"
                                            : "border-muted-foreground/30"
                                        }`}
                                >
                                    {selectedAddressId === addr.id && (
                                        <div className="h-2 w-2 rounded-full bg-white" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        {addr.fullName}
                                    </p>
                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                        {addr.line1}
                                        {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}
                                        {addr.state ? `, ${addr.state}` : ""} {addr.postalCode}
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        📞 {addr.phone}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))
                )}

                {/* Add new address */}
                {!showAddressForm && (
                    <button
                        onClick={() => setShowAddressForm(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Add New Address
                    </button>
                )}

                {/* Address form */}
                {showAddressForm && (
                    <div className="space-y-3 rounded-xl border border-border bg-card p-5">
                        <h3 className="text-sm font-semibold text-foreground">
                            New Address
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <input
                                placeholder="Full Name *"
                                value={addressForm.fullName}
                                onChange={(e) =>
                                    setAddressForm({ ...addressForm, fullName: e.target.value })
                                }
                                className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                            />
                            <input
                                placeholder="Phone *"
                                value={addressForm.phone}
                                onChange={(e) =>
                                    setAddressForm({ ...addressForm, phone: e.target.value })
                                }
                                className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                            />
                        </div>
                        <input
                            placeholder="Address Line 1 *"
                            value={addressForm.line1}
                            onChange={(e) =>
                                setAddressForm({ ...addressForm, line1: e.target.value })
                            }
                            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                        />
                        <input
                            placeholder="Address Line 2 (optional)"
                            value={addressForm.line2}
                            onChange={(e) =>
                                setAddressForm({ ...addressForm, line2: e.target.value })
                            }
                            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                        />
                        <div className="grid gap-3 sm:grid-cols-3">
                            <input
                                placeholder="City *"
                                value={addressForm.city}
                                onChange={(e) =>
                                    setAddressForm({ ...addressForm, city: e.target.value })
                                }
                                className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                            />
                            <input
                                placeholder="State"
                                value={addressForm.state}
                                onChange={(e) =>
                                    setAddressForm({ ...addressForm, state: e.target.value })
                                }
                                className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                            />
                            <input
                                placeholder="Postal Code *"
                                value={addressForm.postalCode}
                                onChange={(e) =>
                                    setAddressForm({
                                        ...addressForm,
                                        postalCode: e.target.value,
                                    })
                                }
                                className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                            />
                        </div>
                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={() => setShowAddressForm(false)}
                                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateAddress}
                                disabled={
                                    createAddressMutation.isPending ||
                                    !addressForm.fullName ||
                                    !addressForm.phone ||
                                    !addressForm.line1 ||
                                    !addressForm.city ||
                                    !addressForm.postalCode
                                }
                                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
                            >
                                {createAddressMutation.isPending && (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                )}
                                Save Address
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Continue to payment */}
            <div className="mt-8 border-t border-border pt-6">
                <button
                    onClick={handleProceedToPayment}
                    disabled={!selectedAddressId || initCheckoutMutation.isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                >
                    {initCheckoutMutation.isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Initializing Payment…
                        </>
                    ) : (
                        <>
                            Continue to Payment
                            <ChevronRight className="h-4 w-4" />
                        </>
                    )}
                </button>
                {initCheckoutMutation.isError && (
                    <p className="mt-2 text-center text-sm text-destructive">
                        {initCheckoutMutation.error.message}
                    </p>
                )}

                {/* Trust badges */}
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Encrypted
                    </span>
                    <span className="flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Secure Checkout
                    </span>
                </div>
            </div>
        </div>
    );
}
