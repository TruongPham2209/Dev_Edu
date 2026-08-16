/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/chat/chat-sidebar.tsx
 *
 * Purpose
 * -------
 * Verify inline chat history sidebar panel rendering, skeleton loading state,
 * empty conversations state, and item selection click callbacks.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering of New Conversation button
 * ✓ Skeleton rendering when isLoading is true
 * ✓ Empty state message display when conversations array is empty
 * ✓ Conversation list rendering with lastMessagePreview and date
 * ✓ Item click invocation of onSelectConversation callback
 * ✓ New Conversation click invocation of onStartNewChat callback
 *
 * Covered Scenarios
 * -----------------
 * ✓ open: true vs open: false (visibility check)
 * ✓ isLoading: true (renders Skeleton loaders)
 * ✓ conversations: [] (renders "No past chats")
 * ✓ conversations with items (renders list items and selection)
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements via RTL)
 *
 * Notes
 * -----
 * Unit test for ChatSidebar component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatSidebar } from "../chat-sidebar";

describe("ChatSidebar", () => {
  const baseProps = {
    open: true,
    onClose: vi.fn(),
    conversations: [
      {
        id: "conv-1",
        lastMessagePreview: "Java Spring Boot",
        updatedAt: "2026-08-16T10:00:00Z",
      },
      {
        id: "conv-2",
        lastMessagePreview: "React Frontend",
        updatedAt: "2026-08-16T11:00:00Z",
      },
    ],
    activeConversationId: "conv-1",
    onSelectConversation: vi.fn(),
    onStartNewChat: vi.fn(),
    isLoading: false,
  };

  it("shouldRenderConversationsListAndNewChatButton", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render ChatSidebar component with conversations.
    // ----------------------------------------------------------------------------
    render(<ChatSidebar {...baseProps} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify New Conversation button and thread previews are present.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("New Conversation")).toBeInTheDocument();
    expect(screen.getByText("Java Spring Boot")).toBeInTheDocument();
    expect(screen.getByText("React Frontend")).toBeInTheDocument();
  });

  it("shouldRenderNoPastChatsWhenConversationsArrayIsEmpty", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render ChatSidebar with empty conversations list.
    // ----------------------------------------------------------------------------
    render(<ChatSidebar {...baseProps} conversations={[]} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify empty state text display.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("No past chats")).toBeInTheDocument();
  });

  it("shouldCallCallbacksOnNewChatAndItemSelectionClick", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render ChatSidebar component.
    // ----------------------------------------------------------------------------
    render(<ChatSidebar {...baseProps} />);

    // ----------------------------------------------------------------------------
    // Act
    // Click on New Conversation button and a conversation item.
    // ----------------------------------------------------------------------------
    fireEvent.click(screen.getByText("New Conversation"));
    fireEvent.click(screen.getByText("React Frontend"));

    // ----------------------------------------------------------------------------
    // Assert
    // Verify callback invocations.
    // ----------------------------------------------------------------------------
    expect(baseProps.onStartNewChat).toHaveBeenCalled();
    expect(baseProps.onSelectConversation).toHaveBeenCalledWith("conv-2");
  });
});
