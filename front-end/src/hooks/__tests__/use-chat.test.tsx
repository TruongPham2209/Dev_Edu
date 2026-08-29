/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/hooks/use-chat.ts
 *
 * Purpose
 * -------
 * Verify encapsulation of chatbot state, message sending logic, input length validation,
 * conversation switching, mode toggle, and automatic mode reset on chatbot close.
 *
 * Tested Features
 * ---------------
 * ✓ Initial state default values
 * ✓ Toggle open/close and sidebar state
 * ✓ Mode toggle (default <-> expanded)
 * ✓ Automatic mode reset to default when chatbot is closed
 * ✓ Input character counting and 500 max limit validation
 * ✓ Send message optimistic UI updates and backend response handling
 * ✓ Start new conversation state reset
 * ✓ Conversation selection
 *
 * Covered Scenarios
 * -----------------
 * ✓ isOpen: false -> true -> false
 * ✓ toggleChatMode: default -> expanded -> default
 * ✓ inputMessage character count <= 500 vs > 500
 * ✓ sendMessage success flow with user and assistant messages
 * ✓ startNewConversation clearing state
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/use-auth": useAuth
 * - "@/lib/toast-context": useToast
 * - "@/lib/api/chat": useSendChatMessageMutation, useChatConversationsQuery, useConversationMessagesQuery
 *
 * Notes
 * -----
 * Unit test for useChat hook.
 */

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useChat } from "../use-chat";

const mockMutateAsync = vi.fn();
const mockDeleteMutateAsync = vi.fn();

vi.mock("@/lib/use-auth", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: "u-1", fullName: "Test User" },
    role: "STUDENT",
    roles: ["STUDENT"],
  }),
}));

vi.mock("@/lib/toast-context", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock("@/lib/api/chat", () => ({
  useSendChatMessageMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
  useDeleteConversationMutation: () => ({
    mutateAsync: mockDeleteMutateAsync,
    isPending: false,
  }),
  useChatConversationsQuery: () => ({
    data: [],
    isLoading: false,
    refetch: vi.fn(),
  }),
  useConversationMessagesQuery: () => ({
    data: null,
    isLoading: false,
  }),
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

describe("useChat Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shouldInitializeWithDefaultStates", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render hook with initial state.
    // ----------------------------------------------------------------------------
    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper(),
    });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify default initial state values.
    // ----------------------------------------------------------------------------
    expect(result.current.isOpen).toBe(false);
    expect(result.current.isSidebarOpen).toBe(false);
    expect(result.current.chatMode).toBe("default");
    expect(result.current.conversationId).toBeNull();
    expect(result.current.messages).toEqual([]);
    expect(result.current.inputMessage).toBe("");
    expect(result.current.characterCount).toBe(0);
    expect(result.current.isMaxCharExceeded).toBe(false);
  });

  it("shouldToggleOpenSidebarAndChatMode", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // ----------------------------------------------------------------------------
    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper(),
    });

    // ----------------------------------------------------------------------------
    // Act & Assert (Open toggle)
    // ----------------------------------------------------------------------------
    act(() => {
      result.current.toggleOpen();
    });
    expect(result.current.isOpen).toBe(true);

    // ----------------------------------------------------------------------------
    // Act & Assert (Sidebar toggle)
    // ----------------------------------------------------------------------------
    act(() => {
      result.current.toggleSidebar();
    });
    expect(result.current.isSidebarOpen).toBe(true);

    // ----------------------------------------------------------------------------
    // Act & Assert (Chat Mode toggle & Reset on Close)
    // ----------------------------------------------------------------------------
    expect(result.current.chatMode).toBe("default");
    act(() => {
      result.current.toggleChatMode();
    });
    expect(result.current.chatMode).toBe("expanded");

    act(() => {
      result.current.toggleOpen();
    });
    expect(result.current.isOpen).toBe(false);
    expect(result.current.chatMode).toBe("default");
  });

  it("shouldComputeCharacterCountAndMaxLimitCorrectly", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // ----------------------------------------------------------------------------
    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper(),
    });

    // ----------------------------------------------------------------------------
    // Act & Assert (Valid string)
    // ----------------------------------------------------------------------------
    act(() => {
      result.current.setInputMessage("Hello AI");
    });
    expect(result.current.characterCount).toBe(8);
    expect(result.current.isMaxCharExceeded).toBe(false);

    // ----------------------------------------------------------------------------
    // Act & Assert (Exceeded string > 500)
    // ----------------------------------------------------------------------------
    const longText = "a".repeat(501);
    act(() => {
      result.current.setInputMessage(longText);
    });
    expect(result.current.characterCount).toBe(501);
    expect(result.current.isMaxCharExceeded).toBe(true);
  });

  it("shouldSendMessageAndAppendUserAndAssistantMessages", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // ----------------------------------------------------------------------------
    mockMutateAsync.mockResolvedValueOnce({
      conversationId: "conv-123",
      reply: {
        role: "assistant",
        content: "Here are some backend courses for you.",
      },
      courses: [
        {
          courseId: "course-1",
          title: "Spring Boot Masterclass",
          shortDescription: "Learn Spring Boot 3",
          price: 500000,
          thumbnailUrl: "https://example.com/thumb.jpg",
          matchReason: "Matches backend request",
        },
      ],
    });

    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper(),
    });

    // ----------------------------------------------------------------------------
    // Act
    // ----------------------------------------------------------------------------
    act(() => {
      result.current.setInputMessage("Recommend backend courses");
    });

    await act(async () => {
      await result.current.sendMessage();
    });

    // ----------------------------------------------------------------------------
    // Assert
    // ----------------------------------------------------------------------------
    expect(mockMutateAsync).toHaveBeenCalledWith({
      conversationId: null,
      message: "Recommend backend courses",
      history: undefined,
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].content).toBe("Recommend backend courses");
    expect(result.current.messages[1].content).toBe(
      "Here are some backend courses for you.",
    );
    expect(result.current.messages[1].courses).toHaveLength(1);
    expect(result.current.inputMessage).toBe("");
  });

  it("shouldResetStateWhenStartNewConversationIsCalled", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // ----------------------------------------------------------------------------
    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setInputMessage("Draft text");
    });

    // ----------------------------------------------------------------------------
    // Act
    // ----------------------------------------------------------------------------
    act(() => {
      result.current.startNewConversation();
    });

    // ----------------------------------------------------------------------------
    // Assert
    // ----------------------------------------------------------------------------
    expect(result.current.conversationId).toBeNull();
    expect(result.current.messages).toEqual([]);
    expect(result.current.inputMessage).toBe("");
  });

  it("shouldCallDeleteConversationAndResetStateIfActiveConversationIsDeleted", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render hook and select active conversation.
    // ----------------------------------------------------------------------------
    mockDeleteMutateAsync.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.selectConversation("conv-123");
    });
    expect(result.current.conversationId).toBe("conv-123");

    // ----------------------------------------------------------------------------
    // Act
    // Delete active conversation.
    // ----------------------------------------------------------------------------
    await act(async () => {
      await result.current.deleteConversation("conv-123");
    });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify delete mutation invocation and reset to new conversation state.
    // ----------------------------------------------------------------------------
    expect(mockDeleteMutateAsync).toHaveBeenCalledWith("conv-123");
    expect(result.current.conversationId).toBeNull();
    expect(result.current.messages).toEqual([]);
  });
});
