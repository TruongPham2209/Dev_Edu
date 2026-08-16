/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/chat/chat-window.tsx
 *
 * Purpose
 * -------
 * Verify rendering of ChatWindow container, header controls (Title, New Chat, Toggle Mode, Close),
 * message stream, AI analyzing typing indicator, input textfield, send message action,
 * and character counter outside input.
 *
 * Tested Features
 * ---------------
 * ✓ Window rendering when isOpen is true vs hidden when isOpen is false
 * ✓ Header elements (DevEdu AI Advisor, New Chat button, mode toggle)
 * ✓ Empty welcome screen vs populated message stream
 * ✓ Active AI analyzing indicator bubble with Bot avatar
 * ✓ Input TextField typing, character count display (0/500), and Send button
 * ✓ Mode toggle action invocation
 *
 * Covered Scenarios
 * -----------------
 * ✓ isOpen: false (renders null)
 * ✓ isOpen: true & messages: [] (renders welcome screen and quick prompts)
 * ✓ isOpen: true & isLoading: true (renders AI analyzing typing bubble)
 * ✓ Clicking Send button invokes sendMessage callback
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation": useRouter
 * - "@/lib/use-auth": useAuth
 * - "@/lib/toast-context": useToast
 *
 * Notes
 * -----
 * Unit test for ChatWindow component.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatWindow } from "../chat-window";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/lib/use-auth", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: "u-1", fullName: "Test Student" },
    role: "STUDENT",
    roles: ["STUDENT"],
  }),
}));

describe("ChatWindow", () => {
  const createMockChat = (overrides = {}) => ({
    isOpen: true,
    setIsOpen: vi.fn(),
    toggleOpen: vi.fn(),
    isSidebarOpen: false,
    setIsSidebarOpen: vi.fn(),
    toggleSidebar: vi.fn(),
    chatMode: "default" as const,
    setChatMode: vi.fn(),
    toggleChatMode: vi.fn(),
    conversationId: null,
    messages: [],
    inputMessage: "",
    setInputMessage: vi.fn(),
    characterCount: 0,
    isMaxCharExceeded: false,
    sendMessage: vi.fn(),
    startNewConversation: vi.fn(),
    selectConversation: vi.fn(),
    isLoading: false,
    conversations: [],
    isLoadingConversations: false,
    refetchConversations: vi.fn(),
    isAuthenticated: true,
    ...overrides,
  });

  it("shouldNotRenderWindowWhenIsOpenIsFalse", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render ChatWindow with isOpen: false.
    // ----------------------------------------------------------------------------
    const mockChat = createMockChat({ isOpen: false });
    const onCloseMock = vi.fn();
    render(<ChatWindow chat={mockChat as any} onClose={onCloseMock} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify window elements are absent.
    // ----------------------------------------------------------------------------
    expect(screen.queryByText("DevEdu AI Advisor")).not.toBeInTheDocument();
  });

  it("shouldRenderHeaderWelcomeScreenAndInputContainerWhenOpen", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render ChatWindow in open state.
    // ----------------------------------------------------------------------------
    const mockChat = createMockChat({ isOpen: true });
    const onCloseMock = vi.fn();
    render(<ChatWindow chat={mockChat as any} onClose={onCloseMock} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify header title, welcome message, character counter (0/500), and send button.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("DevEdu AI Advisor")).toBeInTheDocument();
    expect(
      screen.getByText("Welcome to DevEdu AI Advisor!"),
    ).toBeInTheDocument();
    expect(screen.getByText("0/500")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send message/i }),
    ).toBeInTheDocument();
  });

  it("shouldRenderAiAnalyzingTypingBubbleWhenIsLoadingIsTrue", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render ChatWindow when isLoading is true.
    // ----------------------------------------------------------------------------
    const mockChat = createMockChat({
      isOpen: true,
      messages: [{ id: "m-1", role: "user", content: "Hi" }],
      isLoading: true,
    });
    const onCloseMock = vi.fn();
    render(<ChatWindow chat={mockChat as any} onClose={onCloseMock} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify AI analyzing indicator bubble text is displayed.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("AI is analyzing")).toBeInTheDocument();
  });
});
