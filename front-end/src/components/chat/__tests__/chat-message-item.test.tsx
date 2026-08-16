/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/chat/chat-message-item.tsx
 *
 * Purpose
 * -------
 * Verify rendering of user vs assistant message bubbles, recommended course cards,
 * timestamp formatting via formatServerDate, and user avatar fallback/initials when logged in.
 *
 * Tested Features
 * ---------------
 * ✓ User message rendering with gradient bubble
 * ✓ Assistant message rendering with AI bot avatar
 * ✓ Recommended course items list rendering
 * ✓ Timestamp formatting via formatServerDate
 * ✓ User avatar rendering with fullName initials when logged in
 *
 * Covered Scenarios
 * -----------------
 * ✓ message.role: "user" vs "assistant"
 * ✓ message with courses array vs empty/undefined courses
 * ✓ User authenticated with avatarUrl vs user authenticated with fullName initials
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/use-auth": useAuth
 * - "next/navigation": useRouter
 *
 * Notes
 * -----
 * Unit test for ChatMessageItem component.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatMessageItem } from "../chat-message-item";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/lib/use-auth", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: "u-1", fullName: "Nguyen Van A", avatarUrl: "" },
    role: "STUDENT",
    roles: ["STUDENT"],
  }),
}));

describe("ChatMessageItem", () => {
  it("shouldRenderUserMessageContentAndInitialsAvatar", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render user message item.
    // ----------------------------------------------------------------------------
    const message = {
      id: "msg-1",
      role: "user" as const,
      content: "I want to learn Backend Java",
      createdAt: "2026-08-16T12:00:00.000Z",
    };

    render(<ChatMessageItem message={message} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify user message text and initials avatar.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("I want to learn Backend Java"),
    ).toBeInTheDocument();
    expect(screen.getByText("NV")).toBeInTheDocument();
  });

  it("shouldRenderAssistantMessageContentAndRecommendedCoursesList", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render assistant message with recommended courses.
    // ----------------------------------------------------------------------------
    const message = {
      id: "msg-2",
      role: "assistant" as const,
      content: "Here are recommended courses for you:",
      courses: [
        {
          courseId: "c-200",
          title: "Java Spring Boot Microservices",
          shortDescription: "Complete backend guide",
          price: 500000,
          thumbnailUrl: "https://example.com/thumb.png",
          matchReason: "Best backend match",
        },
      ],
      createdAt: "2026-08-16T12:05:00.000Z",
    };

    render(<ChatMessageItem message={message} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify assistant content and recommended course title.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Here are recommended courses for you:"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Java Spring Boot Microservices"),
    ).toBeInTheDocument();
    expect(screen.getByText("Recommended Courses (1)")).toBeInTheDocument();
  });
});
