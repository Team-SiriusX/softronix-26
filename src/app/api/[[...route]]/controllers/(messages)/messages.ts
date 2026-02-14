import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import * as z from "zod";
import db from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { authMiddleware } from "../../middleware/auth-middleware";

const app = new Hono()
    .use("/*", authMiddleware)

    // POST /messages/conversations — create or get open conversation
    .post("/conversations", async (c) => {
        const user = c.get("user");

        // Check for existing open conversation
        let conversation = await db.conversation.findFirst({
            where: { userId: user.id, status: "OPEN" },
            include: {
                messages: { orderBy: { createdAt: "asc" } },
                user: { select: { id: true, name: true, image: true, email: true } },
            },
        });

        if (!conversation) {
            conversation = await db.conversation.create({
                data: { userId: user.id },
                include: {
                    messages: { orderBy: { createdAt: "asc" } },
                    user: { select: { id: true, name: true, image: true, email: true } },
                },
            });

            // Notify admin channel about new conversation
            await pusherServer.trigger("admin-messages", "new-conversation", {
                id: conversation.id,
                userId: conversation.userId,
                user: conversation.user,
                status: conversation.status,
                createdAt: conversation.createdAt,
                lastMessage: null,
            });
        }

        return c.json({ data: conversation });
    })

    // GET /messages/conversations — list conversations
    .get("/conversations", async (c) => {
        const user = c.get("user");
        const isAdmin = user.role === "ADMIN";

        const conversations = await db.conversation.findMany({
            where: isAdmin ? {} : { userId: user.id },
            include: {
                user: { select: { id: true, name: true, image: true, email: true } },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
            orderBy: { updatedAt: "desc" },
        });

        const formatted = conversations.map((conv) => ({
            id: conv.id,
            userId: conv.userId,
            user: conv.user,
            status: conv.status,
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt,
            lastMessage: conv.messages[0] || null,
        }));

        return c.json({ data: formatted });
    })

    // GET /messages/conversations/:id — get messages for a conversation
    .get("/conversations/:id", async (c) => {
        const user = c.get("user");
        const conversationId = c.req.param("id");
        const isAdmin = user.role === "ADMIN";

        const conversation = await db.conversation.findUnique({
            where: { id: conversationId },
            include: {
                messages: { orderBy: { createdAt: "asc" } },
                user: { select: { id: true, name: true, image: true, email: true } },
            },
        });

        if (!conversation) {
            return c.json({ error: "Conversation not found" }, 404);
        }

        // Only owner or admin can view
        if (!isAdmin && conversation.userId !== user.id) {
            return c.json({ error: "Forbidden" }, 403);
        }

        return c.json({ data: conversation });
    })

    // POST /messages/conversations/:id — send a message
    .post(
        "/conversations/:id",
        zValidator(
            "json",
            z.object({
                content: z.string().min(1).max(2000),
            })
        ),
        async (c) => {
            const user = c.get("user");
            const conversationId = c.req.param("id");
            const { content } = c.req.valid("json");
            const isAdmin = user.role === "ADMIN";

            const conversation = await db.conversation.findUnique({
                where: { id: conversationId },
            });

            if (!conversation) {
                return c.json({ error: "Conversation not found" }, 404);
            }

            if (!isAdmin && conversation.userId !== user.id) {
                return c.json({ error: "Forbidden" }, 403);
            }

            if (conversation.status === "CLOSED") {
                return c.json({ error: "Conversation is closed" }, 400);
            }

            const message = await db.directMessage.create({
                data: {
                    conversationId,
                    senderId: user.id,
                    senderRole: isAdmin ? "ADMIN" : "USER",
                    content,
                },
            });

            // Update conversation timestamp
            await db.conversation.update({
                where: { id: conversationId },
                data: { updatedAt: new Date() },
            });

            const messagePayload = {
                id: message.id,
                conversationId: message.conversationId,
                senderId: message.senderId,
                senderRole: message.senderRole,
                senderName: user.name,
                content: message.content,
                createdAt: message.createdAt,
            };

            // Push to conversation channel (both admin and user see this)
            await pusherServer.trigger(
                `conversation-${conversationId}`,
                "new-message",
                messagePayload
            );

            // Also notify admin channel for sidebar preview update
            await pusherServer.trigger("admin-messages", "message-update", {
                conversationId,
                lastMessage: messagePayload,
            });

            return c.json({ data: message });
        }
    )

    // PATCH /messages/conversations/:id — close/reopen (admin only)
    .patch(
        "/conversations/:id",
        zValidator(
            "json",
            z.object({
                status: z.enum(["OPEN", "CLOSED"]),
            })
        ),
        async (c) => {
            const user = c.get("user");
            const conversationId = c.req.param("id");
            const { status } = c.req.valid("json");

            if (user.role !== "ADMIN") {
                return c.json({ error: "Admin only" }, 403);
            }

            const conversation = await db.conversation.update({
                where: { id: conversationId },
                data: { status },
            });

            await pusherServer.trigger(
                `conversation-${conversationId}`,
                "status-change",
                { status }
            );

            return c.json({ data: conversation });
        }
    );

export default app;
