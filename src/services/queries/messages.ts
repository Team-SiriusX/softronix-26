/**
 * React Query hooks for HITL messaging.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOrGetConversation,
  fetchConversations,
  fetchConversation,
  sendDirectMessage,
  updateConversationStatus,
} from "../api/messages";

const messageKeys = {
  conversations: ["conversations"] as const,
  conversation: (id: string) => ["conversations", id] as const,
};

/** List all conversations */
export function useConversations(enabled = true) {
  return useQuery({
    queryKey: messageKeys.conversations,
    queryFn: fetchConversations,
    enabled,
    refetchInterval: 30_000,
  });
}

/** Get single conversation with messages */
export function useConversation(id: string | null) {
  return useQuery({
    queryKey: messageKeys.conversation(id ?? ""),
    queryFn: () => fetchConversation(id!),
    enabled: !!id,
  });
}

/** Create or get existing open conversation */
export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrGetConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations });
    },
  });
}

/** Send a direct message */
export function useSendDirectMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      sendDirectMessage(conversationId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.conversation(variables.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations });
    },
  });
}

/** Close/reopen a conversation (admin) */
export function useUpdateConversationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, status }: { conversationId: string; status: "OPEN" | "CLOSED" }) =>
      updateConversationStatus(conversationId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.conversation(variables.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations });
    },
  });
}
