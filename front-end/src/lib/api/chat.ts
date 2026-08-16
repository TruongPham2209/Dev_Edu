import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { apiGet, apiPost } from "./client";
import type {
  ChatConversationSummary,
  ChatMessageDetail,
  ChatMessageRequest,
  ChatMessageResponse,
} from "../type/chat";

// --- API Functions ---

export async function sendChatMessage(
  data: ChatMessageRequest,
): Promise<ChatMessageResponse> {
  return apiPost<ChatMessageResponse>("/api/chat/messages", data);
}

export async function getChatConversations(): Promise<ChatConversationSummary[]> {
  return apiGet<ChatConversationSummary[]>("/api/chat/conversations");
}

export async function getConversationMessages(
  id: string,
): Promise<ChatMessageDetail[]> {
  return apiGet<ChatMessageDetail[]>(`/api/chat/conversations/${id}/messages`);
}

// --- React Query Hooks ---

export function useSendChatMessageMutation(
  options?: UseMutationOptions<ChatMessageResponse, Error, ChatMessageRequest>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendChatMessage,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useChatConversationsQuery(
  enabled: boolean = true,
  options?: Omit<
    UseQueryOptions<ChatConversationSummary[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["chat", "conversations"],
    queryFn: getChatConversations,
    enabled,
    ...options,
  });
}

export function useConversationMessagesQuery(
  id: string | null,
  options?: Omit<
    UseQueryOptions<ChatMessageDetail[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["chat", "messages", id],
    queryFn: () => getConversationMessages(id!),
    enabled: Boolean(id),
    ...options,
  });
}
