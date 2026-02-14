"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/hooks/use-cart-store";
import { useSession } from "@/lib/auth-client";
import { onAgentEvent } from "@/lib/agent-events";
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

    // Refs for agent event handlers to access latest state
    const selectedAddressIdRef = useRef(selectedAddressId);
    selectedAddressIdRef.current = selectedAddressId;
    const addressFormRef = useRef(addressForm);
    addressFormRef.current = addressForm;

    // Stable handler refs
    const handleCreateAddressRef = useRef(handleCreateAddress);
    handleCreateAddressRef.current = handleCreateAddress;
    const handleProceedRef = useRef(handleProceedToPayment);
    handleProceedRef.current = handleProceedToPayment;

    // ─── Agent event listeners ───────────────────────────────
    useEffect(() => {
        const cleanups = [
            onAgentEvent("agent:fillAddress", (payload) => {
                setShowAddressForm(true);
                setAddressForm({
                    fullName: payload.fullName || "",
                    phone: payload.phone || "",
                    line1: payload.line1 || "",
                    line2: payload.line2 || "",
                    city: payload.city || "",
                    state: payload.state || "",
                    postalCode: payload.postalCode || "",
                });
            }),
            onAgentEvent("agent:selectAddress", (payload) => {
                const addresses = addressQuery.data?.data ?? [];
                const idx = payload.addressIndex - 1; // 1-based → 0-based
                if (addresses[idx]) {
                    setSelectedAddressId(addresses[idx].id);
                }
            }),
            onAgentEvent("agent:submitAddress", () => {
                // Small delay to let React state settle from fillAddress
                setTimeout(() => {
                    handleCreateAddressRef.current();
                }, 300);
            }),
            onAgentEvent("agent:proceedToPayment", () => {
                // Small delay to let address selection/creation settle
                setTimeout(() => {
                    handleProceedRef.current();
                }, 500);
            }),
        ];
        return () => cleanups.forEach((fn) => fn());
    }, [addressQuery.data]);

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
            <div className="min-h-screen bg-[#f2efe9] selection:bg-[#1c1c1c] selection:text-[#f2efe9]">
                <div className="mx-auto flex max-w-lg flex-col items-center gap-5 px-4 py-24 text-center">
                    <div className="bg-[#e8e5df] p-8 rounded-sm">
                        <Lock className="h-12 w-12 text-[#1c1c1c]/40" />
                    </div>
                    <h2 className="font-gloock text-2xl text-[#1c1c1c]">Sign in to continue</h2>
                    <p className="text-sm text-[#5c5c5c]">
                        You need to be signed in to complete your purchase.
                    </p>
                    <Link
                        href="/auth/sign-in"
                        className="border border-[#1c1c1c] bg-[#1c1c1c] px-6 py-3 text-sm font-medium uppercase tracking-widest text-[#f2efe9] transition-all hover:bg-transparent hover:text-[#1c1c1c]"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    // ─── Guard: empty cart ───────────────────────────────────
    if (!cartLoading && items.length === 0 && step === "address") {
        return (
            <div className="min-h-screen bg-[#f2efe9] selection:bg-[#1c1c1c] selection:text-[#f2efe9]">
                <div className="mx-auto flex max-w-lg flex-col items-center gap-5 px-4 py-24 text-center">
                    <div className="bg-[#e8e5df] p-8 rounded-sm">
                        <ShoppingBag className="h-12 w-12 text-[#1c1c1c]/40" />
                    </div>
                    <h2 className="font-gloock text-2xl text-[#1c1c1c]">Your cart is empty</h2>
                    <p className="text-sm text-[#5c5c5c]">
                        Add items to your cart before checking out.
                    </p>
                    <Link
                        href="/products"
                        className="border border-[#1c1c1c] bg-[#1c1c1c] px-6 py-3 text-sm font-medium uppercase tracking-widest text-[#f2efe9] transition-all hover:bg-transparent hover:text-[#1c1c1c]"
                    >
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    // ─── Step indicator ──────────────────────────────────────
    const StepIndicator = () => (
        <div className="mb-8 flex items-center justify-center gap-3">
            <div
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium uppercase tracking-widest transition-colors ${step === "address"
                        ? "bg-[#1c1c1c] text-[#f2efe9]"
                        : "bg-[#1c1c1c]/5 text-[#1c1c1c]"
                    }`}
            >
                <MapPin className="h-3.5 w-3.5" />
                Address
            </div>
            <ChevronRight className="h-4 w-4 text-[#5c5c5c]" />
            <div
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium uppercase tracking-widest transition-colors ${step === "payment"
                        ? "bg-[#1c1c1c] text-[#f2efe9]"
                        : "bg-[#e8e5df] text-[#5c5c5c]"
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
            <div className="min-h-screen bg-[#f2efe9] selection:bg-[#1c1c1c] selection:text-[#f2efe9]">
                <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
                    <StepIndicator />
                    <div className="mb-6">
                        <button
                            onClick={() => setStep("address")}
                            className="mb-4 flex items-center gap-1.5 text-sm font-medium uppercase tracking-widest text-[#5c5c5c] transition-colors hover:text-[#1c1c1c]"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to address
                        </button>
                        <h1 className="font-gloock text-2xl text-[#1c1c1c]">
                            Payment
                        </h1>
                        <p className="mt-1 text-sm text-[#5c5c5c]">
                            Order #{paymentData.orderId.slice(0, 8)}… •{" "}
                            <span className="font-semibold text-[#1c1c1c]">
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
            </div>
        );
    }

    // ─── Address step ────────────────────────────────────────
    const addresses = addressQuery.data?.data ?? [];

    return (
        <div className="min-h-screen bg-[#f2efe9] selection:bg-[#1c1c1c] selection:text-[#f2efe9]">
            <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
                <StepIndicator />

                <div className="mb-8 flex items-center gap-4">
                    <Link
                        href="/cart"
                        className="flex h-10 w-10 items-center justify-center border border-[#1c1c1c]/20 transition-colors hover:bg-[#e8e5df]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="font-gloock text-2xl text-[#1c1c1c]">
                            Shipping Address
                        </h1>
                        <p className="mt-0.5 text-sm text-[#5c5c5c]">
                            Where should we deliver your order?
                        </p>
                    </div>
                </div>

            {/* Order summary mini */}
            <div className="mb-6 flex items-center justify-between border border-[#1c1c1c]/10 bg-[#e8e5df] px-4 py-3">
                <span className="text-sm text-[#5c5c5c]">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
                <span className="font-gloock text-base text-[#1c1c1c]">
                    Rs.{total.toLocaleString()}
                </span>
            </div>

            {/* Saved addresses */}
            <div className="space-y-3">
                {addressQuery.isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-[#5c5c5c]" />
                    </div>
                ) : (
                    addresses.map((addr) => (
                        <button
                            key={addr.id}
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`w-full border p-4 text-left transition-all ${selectedAddressId === addr.id
                                    ? "border-[#1c1c1c] bg-[#1c1c1c]/5"
                                    : "border-[#1c1c1c]/10 hover:border-[#1c1c1c]/40 hover:bg-[#e8e5df]"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={`mt-0.5 flex h-5 w-5 items-center justify-center border-2 transition-colors ${selectedAddressId === addr.id
                                            ? "border-[#1c1c1c] bg-[#1c1c1c]"
                                            : "border-[#5c5c5c]/30"
                                        }`}
                                >
                                    {selectedAddressId === addr.id && (
                                        <div className="h-2 w-2 bg-[#f2efe9]" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[#1c1c1c]">
                                        {addr.fullName}
                                    </p>
                                    <p className="mt-0.5 text-sm text-[#5c5c5c]">
                                        {addr.line1}
                                        {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}
                                        {addr.state ? `, ${addr.state}` : ""} {addr.postalCode}
                                    </p>
                                    <p className="mt-0.5 text-xs text-[#5c5c5c]">
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
                        className="flex w-full items-center justify-center gap-2 border border-dashed border-[#1c1c1c]/20 py-4 text-sm font-medium uppercase tracking-widest text-[#5c5c5c] transition-colors hover:border-[#1c1c1c] hover:text-[#1c1c1c]"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Add New Address
                    </button>
                )}

                {/* Address form */}
                {showAddressForm && (
                    <div className="space-y-3 border border-[#1c1c1c]/10 bg-[#e8e5df] p-5">
                        <h3 className="text-sm font-semibold uppercase tracking-widest text-[#1c1c1c]">
                            New Address
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <input
                                placeholder="Full Name *"
                                value={addressForm.fullName}
                                onChange={(e) =>
                                    setAddressForm({ ...addressForm, fullName: e.target.value })
                                }
                                className="border border-[#1c1c1c]/20 bg-[#f2efe9] px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#1c1c1c]"
                            />
                            <input
                                placeholder="Phone *"
                                value={addressForm.phone}
                                onChange={(e) =>
                                    setAddressForm({ ...addressForm, phone: e.target.value })
                                }
                                className="border border-[#1c1c1c]/20 bg-[#f2efe9] px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#1c1c1c]"
                            />
                        </div>
                        <input
                            placeholder="Address Line 1 *"
                            value={addressForm.line1}
                            onChange={(e) =>
                                setAddressForm({ ...addressForm, line1: e.target.value })
                            }
                            className="w-full border border-[#1c1c1c]/20 bg-[#f2efe9] px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#1c1c1c]"
                        />
                        <input
                            placeholder="Address Line 2 (optional)"
                            value={addressForm.line2}
                            onChange={(e) =>
                                setAddressForm({ ...addressForm, line2: e.target.value })
                            }
                            className="w-full border border-[#1c1c1c]/20 bg-[#f2efe9] px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#1c1c1c]"
                        />
                        <div className="grid gap-3 sm:grid-cols-3">
                            <input
                                placeholder="City *"
                                value={addressForm.city}
                                onChange={(e) =>
                                    setAddressForm({ ...addressForm, city: e.target.value })
                                }
                                className="border border-[#1c1c1c]/20 bg-[#f2efe9] px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#1c1c1c]"
                            />
                            <input
                                placeholder="State"
                                value={addressForm.state}
                                onChange={(e) =>
                                    setAddressForm({ ...addressForm, state: e.target.value })
                                }
                                className="border border-[#1c1c1c]/20 bg-[#f2efe9] px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#1c1c1c]"
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
                                className="border border-[#1c1c1c]/20 bg-[#f2efe9] px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#1c1c1c]"
                            />
                        </div>
                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={() => setShowAddressForm(false)}
                                className="border border-[#1c1c1c]/20 px-4 py-2 text-sm font-medium uppercase tracking-widest transition-colors hover:bg-[#f2efe9]"
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
                                className="flex items-center gap-2 border border-[#1c1c1c] bg-[#1c1c1c] px-4 py-2 text-sm font-medium uppercase tracking-widest text-[#f2efe9] transition-all hover:bg-transparent hover:text-[#1c1c1c] disabled:opacity-50"
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
            <div className="mt-8 border-t border-[#1c1c1c]/10 pt-6">
                <button
                    onClick={handleProceedToPayment}
                    disabled={!selectedAddressId || initCheckoutMutation.isPending}
                    className="flex w-full items-center justify-center gap-2 border border-[#1c1c1c] bg-[#1c1c1c] px-4 py-3.5 text-sm font-medium uppercase tracking-widest text-[#f2efe9] transition-all hover:bg-transparent hover:text-[#1c1c1c] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
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
                    <p className="mt-2 text-center text-sm text-red-600">
                        {initCheckoutMutation.error.message}
                    </p>
                )}

                {/* Trust badges */}
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-[#5c5c5c]">
                    <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Encrypted
                    </span>
                    <span className="flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Secure Checkout
                    </span>
                </div>
            </div>
        </div>
        </div>
    );
}
