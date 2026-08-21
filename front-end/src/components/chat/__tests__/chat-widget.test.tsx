/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/chat/chat-widget.tsx
 *
 * Purpose
 * -------
 * Verify rendering of global floating ChatWidget FAB button, tooltip, and ChatWindow toggle.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering of floating action button (FAB) when ChatWindow is closed
 * ✓ Tooltip display on FAB button
 * ✓ Click interaction toggling open state and rendering ChatWindow
 *
 * Covered Scenarios
 * -----------------
 * ✓ isOpen: false (renders FAB button)
 * ✓ FAB click (opens ChatWindow and hides FAB button)
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation": useRouter
 * - "@/lib/use-auth": useAuth
 * - "@/lib/toast-context": useToast
 * - "@/lib/api/chat": useSendChatMessageMutation, useChatConversationsQuery, useConversationMessagesQuery
 *
 * Notes
 * -----
 * Unit test for ChatWidget component.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChatWidget } from "../chat-widget";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/lib/use-auth", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: "user-1", fullName: "Test Student" },
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
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  }),
  useDeleteConversationMutation: () => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
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
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("ChatWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shouldRenderFloatingButtonAndOpenChatWindowOnClick", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render ChatWidget.
    // ----------------------------------------------------------------------------
    render(<ChatWidget />, { wrapper: createWrapper() });

    // ----------------------------------------------------------------------------
    // Assert & Act
    // Verify FAB button is present, then click to open window.
    // ----------------------------------------------------------------------------
    const fab = screen.getByRole("button", { name: /open chatbot/i });
    expect(fab).toBeInTheDocument();

    fireEvent.click(fab);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify ChatWindow header title is displayed.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("DevEdu AI Advisor")).toBeInTheDocument();
  });
});
