"use client";

import { useState } from "react";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2, CreditCard, CheckCircle, XCircle } from "lucide-react";

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_API_KEY ?? ""
);

// ─── Inner form (inside Elements provider) ─────────────────

function CheckoutFormInner({
    orderId,
    totalAmount,
    onSuccess,
    onCancel,
}: {
    orderId: string;
    totalAmount: number;
    onSuccess: () => void;
    onCancel: () => void;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [isPaying, setIsPaying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [succeeded, setSucceeded] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements || isPaying) return;

        setIsPaying(true);
        setError(null);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setError(submitError.message ?? "Payment failed");
            setIsPaying(false);
            return;
        }

        const { error: confirmError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/orders?payment=success&orderId=${orderId}`,
            },
            redirect: "if_required",
        });

        if (confirmError) {
            setError(confirmError.message ?? "Payment failed");
            setIsPaying(false);
        } else {
            setSucceeded(true);
            setIsPaying(false);
            onSuccess();
        }
    };

    if (succeeded) {
        return (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="rounded-full bg-emerald-100 p-4 dark:bg-emerald-900/30">
                    <CheckCircle className="h-10 w-10 text-emerald-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-foreground">
                        Payment Successful!
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Your order has been placed. Order #{orderId.slice(0, 8)}…
                    </p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-xl border border-border bg-card p-4">
                <PaymentElement
                    options={{
                        layout: "tabs",
                    }}
                />
            </div>

            {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    <XCircle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-xl font-extrabold text-foreground">
                    Rs.{totalAmount.toLocaleString()}
                </span>
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isPaying}
                    className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!stripe || !elements || isPaying}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                >
                    {isPaying ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing…
                        </>
                    ) : (
                        <>
                            <CreditCard className="h-4 w-4" />
                            Pay Now
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

// ─── Wrapper with Elements provider ────────────────────────

export function CheckoutForm({
    clientSecret,
    orderId,
    totalAmount,
    onSuccess,
    onCancel,
}: {
    clientSecret: string;
    orderId: string;
    totalAmount: number;
    onSuccess: () => void;
    onCancel: () => void;
}) {
    return (
        <Elements
            stripe={stripePromise}
            options={{
                clientSecret,
                appearance: {
                    theme: "stripe",
                    variables: {
                        borderRadius: "8px",
                    },
                },
            }}
        >
            <CheckoutFormInner
                orderId={orderId}
                totalAmount={totalAmount}
                onSuccess={onSuccess}
                onCancel={onCancel}
            />
        </Elements>
    );
}
