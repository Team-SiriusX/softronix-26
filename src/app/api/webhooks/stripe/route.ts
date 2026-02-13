/**
 * Stripe Webhook Handler
 *
 * IMPORTANT: This is a separate Next.js route handler (NOT inside Hono)
 * because we need raw body access for Stripe signature verification.
 *
 * Stripe is the SOURCE OF TRUTH for payment status.
 * - payment_intent.succeeded → Mark order PAID, clear cart
 * - payment_intent.payment_failed → Mark order FAILED
 */

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import db from "@/lib/db";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  // 1. Read raw body for signature verification
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  // 2. Verify webhook signature
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("⚠️ Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // 3. Handle events
  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object;
        const { orderId } = intent.metadata;

        if (!orderId) {
          console.error("⚠️ payment_intent.succeeded missing orderId metadata");
          break;
        }

        // Find payment by intentId
        const payment = await db.payment.findUnique({
          where: { intentId: intent.id },
          include: { order: { include: { user: true } } },
        });

        if (!payment) {
          console.error(`⚠️ No payment found for intentId: ${intent.id}`);
          break;
        }

        // Already processed — idempotent
        if (payment.status === "PAID") {
          console.log(`✅ Payment ${payment.id} already marked PAID (idempotent)`);
          break;
        }

        // Transactional: mark PAID + clear cart
        await db.$transaction(async (tx) => {
          // Mark payment as PAID
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: "PAID" },
          });

          // Mark order as PAID
          await tx.order.update({
            where: { id: payment.orderId },
            data: {
              status: "PAID",
              paymentStatus: "PAID",
            },
          });

          // Clear cart items (keep cart shell)
          const cart = await tx.cart.findUnique({
            where: { userId: payment.order.userId },
          });
          if (cart) {
            await tx.cartItem.deleteMany({
              where: { cartId: cart.id },
            });
          }
        });

        console.log(`✅ Order ${orderId} marked PAID, cart cleared`);
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object;

        const payment = await db.payment.findUnique({
          where: { intentId: intent.id },
        });

        if (!payment) {
          console.error(`⚠️ No payment found for intentId: ${intent.id}`);
          break;
        }

        // Already processed
        if (payment.status === "FAILED") break;

        await db.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: "FAILED" },
          });

          await tx.order.update({
            where: { id: payment.orderId },
            data: {
              status: "CANCELLED",
              paymentStatus: "FAILED",
            },
          });
        });

        console.log(`❌ Payment failed for order ${payment.orderId}`);
        break;
      }

      default:
        // Unhandled event type — log and acknowledge
        console.log(`ℹ️ Unhandled Stripe event: ${event.type}`);
    }
  } catch (error) {
    console.error("⚠️ Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  // Always return 200 to Stripe to prevent retries for handled events
  return NextResponse.json({ received: true });
}
