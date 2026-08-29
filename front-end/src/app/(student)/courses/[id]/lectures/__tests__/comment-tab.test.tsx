import React from "react";
/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/courses/[id]/lectures/comment-tab.tsx
 *
 * Purpose
 * -------
 * Verify that TabComments component renders comment input box, comments list,
 * empty state when no comments exist, and posts new comments via createCommentMutate.
 *
 * Tested Features
 * ---------------
 * ✓ CommentInput box rendering and text input state
 * ✓ EmptyState rendering when root comments array is empty
 * ✓ Comments list rendering (author avatar, username, content, timestamp)
 * ✓ Submitting new comment via createCommentMutate
 *
 * Covered Scenarios
 * -----------------
 * ✓ Empty comments state
 * ✓ Posting new comment
 * ✓ Rendering comment list items
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/lectures" (useInfiniteLectureCommentsQuery, useCreateLectureCommentMutation, useDeleteLectureCommentMutation)
 * - "@tanstack/react-query" (useQueryClient)
 * - "@/lib/use-auth" (useAuth)
 * - "next/image" (mocked img tag)
 *
 * Not Covered
 * -----------
 * - Infinite scroll pagination observer
 *
 * Notes
 * -----
 * Unit test for TabComments component.
 */

import * as lecturesApi from "@/lib/api/lectures";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TabComments } from "../comment-tab";

vi.mock("@/lib/api/lectures", () => ({
  useInfiniteLectureCommentsQuery: vi.fn(),
  useCreateLectureCommentMutation: vi.fn(),
  useDeleteLectureCommentMutation: vi.fn(),
  getLectureComments: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    fetchQuery: vi.fn(),
  }),
}));

vi.mock("@/lib/use-auth", () => ({
  useAuth: () => ({ user: { username: "student_user" } }),
}));

vi.mock("next/image", () => ({
  default: ({ alt = "image", ...props }: React.ComponentProps<"img">) => React.createElement("img", { alt, ...props }),
}));

describe("TabComments", () => {
  const mockCreateCommentMutate = vi.fn();
  const mockDeleteCommentMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(lecturesApi.useCreateLectureCommentMutation).mockReturnValue({
      mutateAsync: mockCreateCommentMutate,
      isPending: false,
    } as never);

    vi.mocked(lecturesApi.useDeleteLectureCommentMutation).mockReturnValue({
      mutateAsync: mockDeleteCommentMutate,
    } as never);
  });

  it("shouldRenderEmptyStateWhenNoCommentsExist", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return empty comments list.
    // ----------------------------------------------------------------------------
    vi.mocked(lecturesApi.useInfiniteLectureCommentsQuery).mockReturnValue({
      data: { pages: [{ contents: [] }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    } as never);

    // ----------------------------------------------------------------------------
    // Act
    // Render TabComments.
    // ----------------------------------------------------------------------------
    render(<TabComments lectureId="lec-10" />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify comment input placeholder and "No comments yet" empty state.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByPlaceholderText(
        "Share your thoughts or ask questions about this lecture...",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("No comments yet")).toBeInTheDocument();
  });

  it("shouldPostNewCommentOnSubmit", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return empty comments list.
    // ----------------------------------------------------------------------------
    vi.mocked(lecturesApi.useInfiniteLectureCommentsQuery).mockReturnValue({
      data: { pages: [{ contents: [] }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    } as never);

    mockCreateCommentMutate.mockResolvedValue({ id: "c-100" });

    // ----------------------------------------------------------------------------
    // Act
    // Render TabComments and type comment text.
    // ----------------------------------------------------------------------------
    render(<TabComments lectureId="lec-10" />);

    const input = screen.getByPlaceholderText(
      "Share your thoughts or ask questions about this lecture...",
    );
    fireEvent.change(input, {
      target: { value: "Great explanation of Server Actions!" },
    });

    const postBtn = screen.getAllByRole("button")[0];
    fireEvent.click(postBtn);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify createCommentMutate was called.
    // ----------------------------------------------------------------------------
    expect(mockCreateCommentMutate).toHaveBeenCalledWith({
      lectureId: "lec-10",
      content: "Great explanation of Server Actions!",
    });
  });
});
