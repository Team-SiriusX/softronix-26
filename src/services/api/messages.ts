/**
 * Messages API service — pure fetch functions for HITL messaging.
 */

export interface ConversationUser {
  id: string;
  name: string;
  image: string | null;
  email: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: "USER" | "ADMIN";
  senderName?: string;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  user: ConversationUser;
  status: "OPEN" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  lastMessage: DirectMessage | null;
  messages?: DirectMessage[];
}

/** Create or resume an open conversation for the current user */
export async function createOrGetConversation(): Promise<{ data: Conversation }> {
  const res = await fetch("/api/messages/conversations", { method: "POST" });
  if (!res.ok) throw new Error("Failed to create conversation");
  return res.json();
}

/** List all conversations (admin sees all, user sees own) */
export async function fetchConversations(): Promise<{ data: Conversation[] }> {
  const res = await fetch("/api/messages/conversations");
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}

/** Get a single conversation with all messages */
export async function fetchConversation(id: string): Promise<{ data: Conversation }> {
  const res = await fetch(`/api/messages/conversations/${id}`);
  if (!res.ok) throw new Error("Failed to fetch conversation");
  return res.json();
}

/** Send a message to a conversation */
export async function sendDirectMessage(
  conversationId: string,
  content: string
): Promise<{ data: DirectMessage }> {
  const res = await fetch(`/api/messages/conversations/${conversationId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

/** Close or reopen a conversation (admin only) */
export async function updateConversationStatus(
  conversationId: string,
  status: "OPEN" | "CLOSED"
): Promise<{ data: Conversation }> {
  const res = await fetch(`/api/messages/conversations/${conversationId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update conversation");
  return res.json();
}
