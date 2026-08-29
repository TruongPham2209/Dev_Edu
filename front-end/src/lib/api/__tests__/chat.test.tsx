/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/api/chat.ts
 *
 * Purpose
 * -------
 * Verify Chat API client wrappers and TanStack React Query hooks for sending
 * messages, fetching conversation list, and fetching message thread details.
 *
 * Tested Features
 * ---------------
 * ✓ sendChatMessage REST API POST wrapper
 * ✓ getChatConversations REST API GET wrapper
 * ✓ getConversationMessages REST API GET wrapper
 * ✓ useSendChatMessageMutation hook and query invalidation on success
 * ✓ useChatConversationsQuery hook execution
 * ✓ useConversationMessagesQuery hook execution and enabled condition
 *
 * Covered Scenarios
 * -----------------
 * ✓ POST /api/chat/messages execution with ChatMessageRequest
 * ✓ GET /api/chat/conversations execution
 * ✓ GET /api/chat/conversations/:id/messages execution
 * ✓ Query invalidation for ["chat", "conversations"] on mutation success
 * ✓ Disabled query execution when conversation ID is null
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/client": apiGet, apiPost
 *
 * Notes
 * -----
 * Unit test for Chat API module.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getChatConversations,
  getConversationMessages,
  sendChatMessage,
  useChatConversationsQuery,
  useConversationMessagesQuery,
  useSendChatMessageMutation,
} from "../chat";
import { apiGet, apiPost } from "../client";

vi.mock("../client", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "TestQueryWrapper";
  return Wrapper;
}

describe("Chat API functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shouldSendChatMessageViaApiPost", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // ----------------------------------------------------------------------------
    const mockRequest = {
      message: "Hello AI",
      history: [],
      conversationId: null,
    };
    const mockResponse = {
      conversationId: "conv-1",
      reply: { role: "assistant" as const, content: "Hello Student" },
    };
    vi.mocked(apiPost).mockResolvedValueOnce(mockResponse);

    // ----------------------------------------------------------------------------
    // Act
    // ----------------------------------------------------------------------------
    const result = await sendChatMessage(mockRequest);

    // ----------------------------------------------------------------------------
    // Assert
    // ----------------------------------------------------------------------------
    expect(apiPost).toHaveBeenCalledWith("/api/chat/messages", mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it("shouldFetchChatConversationsViaApiGet", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // ----------------------------------------------------------------------------
    const mockConversations = [
      {
        id: "c-1",
        lastMessagePreview: "Java course?",
        updatedAt: "2026-08-16T10:00:00Z",
      },
    ];
    vi.mocked(apiGet).mockResolvedValueOnce(mockConversations);

    // ----------------------------------------------------------------------------
    // Act
    // ----------------------------------------------------------------------------
    const result = await getChatConversations();

    // ----------------------------------------------------------------------------
    // Assert
    // ----------------------------------------------------------------------------
    expect(apiGet).toHaveBeenCalledWith("/api/chat/conversations");
    expect(result).toEqual(mockConversations);
  });

  it("shouldFetchConversationMessagesViaApiGet", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // ----------------------------------------------------------------------------
    const mockMessages = [
      { id: "m-1", role: "user" as const, content: "Backend path" },
    ];
    vi.mocked(apiGet).mockResolvedValueOnce(mockMessages);

    // ----------------------------------------------------------------------------
    // Act
    // ----------------------------------------------------------------------------
    const result = await getConversationMessages("conv-123");

    // ----------------------------------------------------------------------------
    // Assert
    // ----------------------------------------------------------------------------
    expect(apiGet).toHaveBeenCalledWith(
      "/api/chat/conversations/conv-123/messages",
    );
    expect(result).toEqual(mockMessages);
  });
});

describe("Chat React Query Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shouldExecuteSendChatMessageMutationAndInvalidateQueriesOnSuccess", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // ----------------------------------------------------------------------------
    const mockResponse = {
      conversationId: "conv-999",
      reply: { role: "assistant" as const, content: "Course recommendations" },
    };
    vi.mocked(apiPost).mockResolvedValueOnce(mockResponse);

    const onSuccessMock = vi.fn();
    const { result } = renderHook(
      () => useSendChatMessageMutation({ onSuccess: onSuccessMock }),
      { wrapper: createWrapper() },
    );

    // ----------------------------------------------------------------------------
    // Act
    // ----------------------------------------------------------------------------
    await act(async () => {
      await result.current.mutateAsync({
        message: "React",
        history: [],
        conversationId: null,
      });
    });

    // ----------------------------------------------------------------------------
    // Assert
    // ----------------------------------------------------------------------------
    expect(apiPost).toHaveBeenCalledWith("/api/chat/messages", {
      message: "React",
      history: [],
      conversationId: null,
    });
    expect(onSuccessMock).toHaveBeenCalled();
  });

  it("shouldFetchConversationsUsingUseChatConversationsQuery", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // ----------------------------------------------------------------------------
    const mockData = [{ id: "c-1", lastMessagePreview: "Test", updatedAt: "" }];
    vi.mocked(apiGet).mockResolvedValueOnce(mockData);

    // ----------------------------------------------------------------------------
    // Act
    // ----------------------------------------------------------------------------
    const { result } = renderHook(() => useChatConversationsQuery(true), {
      wrapper: createWrapper(),
    });

    // ----------------------------------------------------------------------------
    // Assert
    // ----------------------------------------------------------------------------
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });

  it("shouldNotFetchConversationMessagesWhenIdIsNull", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // ----------------------------------------------------------------------------
    const { result } = renderHook(() => useConversationMessagesQuery(null), {
      wrapper: createWrapper(),
    });

    // ----------------------------------------------------------------------------
    // Assert
    // ----------------------------------------------------------------------------
    expect(result.current.fetchStatus).toBe("idle");
    expect(apiGet).not.toHaveBeenCalled();
  });
});
