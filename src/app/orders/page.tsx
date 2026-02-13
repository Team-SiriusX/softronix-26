"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { useOrders } from "@/services/queries/orders";
import {
    Package,
    Loader2,
    ChevronDown,
    ChevronUp,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const statusConfig = {
    PENDING: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", label: "Pending" },
    PAID: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", label: "Paid" },
    SHIPPED: { icon: Truck, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", label: "Shipped" },
    DELIVERED: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", label: "Delivered" },
    CANCELLED: { icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", label: "Cancelled" },
} as const;

const paymentConfig = {
    UNPAID: { color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", label: "Unpaid" },
    PAID: { color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30", label: "Paid" },
    FAILED: { color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30", label: "Failed" },
    REFUNDED: { color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30", label: "Refunded" },
} as const;

export default function OrdersPage() {
    const session = useSession();
    const userId = session.data?.user?.id;
    const { data, isLoading } = useOrders(userId);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    const orders = data?.data ?? [];

    if (!userId) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-24 text-center">
                <Package className="mx-auto h-16 w-16 text-muted-foreground/30" />
                <h2 className="mt-4 text-lg font-bold text-foreground">Sign in to view orders</h2>
                <p className="mt-1 text-sm text-muted-foreground">You need to be signed in to track your orders.</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
            <div className="mb-8 flex items-center gap-4">
                <Link
                    href="/products"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border transition-colors hover:bg-muted"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                        My Orders
                    </h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        Track and manage your orders
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center gap-3 py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading orders…</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-border bg-card/50 py-24">
                    <div className="rounded-2xl bg-muted/50 p-6">
                        <Package className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-semibold text-foreground">No orders yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">Your orders will appear here</p>
                    </div>
                    <Link
                        href="/products"
                        className="mt-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order: any) => {
                        const status = statusConfig[order.status as keyof typeof statusConfig] ?? statusConfig.PENDING;
                        const payment = paymentConfig[order.paymentStatus as keyof typeof paymentConfig] ?? paymentConfig.UNPAID;
                        const StatusIcon = status.icon;
                        const isExpanded = expandedOrder === order.id;

                        return (
                            <div
                                key={order.id}
                                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                            >
                                {/* Order header */}
                                <button
                                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                    className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-muted/30"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`rounded-xl p-2.5 ${status.bg}`}>
                                            <StatusIcon className={`h-5 w-5 ${status.color}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                Order #{order.id.slice(0, 8)}
                                            </p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {new Date(order.createdAt).toLocaleDateString("en-PK", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                                {" · "}
                                                {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-foreground">
                                                Rs.{order.totalAmount.toLocaleString()}
                                            </p>
                                            <div className="mt-0.5 flex items-center gap-1.5">
                                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.bg} ${status.color}`}>
                                                    {status.label}
                                                </span>
                                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${payment.bg} ${payment.color}`}>
                                                    {payment.label}
                                                </span>
                                            </div>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </div>
                                </button>

                                {/* Expanded items */}
                                {isExpanded && (
                                    <div className="border-t border-border bg-muted/10 px-5 py-4">
                                        <div className="space-y-3">
                                            {order.items?.map((item: any) => (
                                                <div key={item.id} className="flex items-center gap-3">
                                                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                                                        {item.product?.image ? (
                                                            <Image
                                                                src={item.product.image}
                                                                alt={item.product.name ?? "Product"}
                                                                fill
                                                                sizes="56px"
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center">
                                                                <Package className="h-5 w-5 text-muted-foreground/30" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-foreground">
                                                            {item.product?.name ?? item.productId}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Qty: {item.quantity} × Rs.{item.priceSnapshot.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-foreground">
                                                        Rs.{(item.quantity * item.priceSnapshot).toLocaleString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        {order.address && (
                                            <div className="mt-4 rounded-lg bg-muted/50 p-3">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase">
                                                    Shipping Address
                                                </p>
                                                <p className="mt-1 text-sm text-foreground">
                                                    {order.address.fullName} · {order.address.phone}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {order.address.line1}
                                                    {order.address.line2 ? `, ${order.address.line2}` : ""},
                                                    {" "}{order.address.city} {order.address.postalCode}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
