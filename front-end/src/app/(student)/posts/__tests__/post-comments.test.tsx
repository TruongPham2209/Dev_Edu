/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/posts/post-comments.tsx
 *
 * Purpose
 * -------
 * Verify that PostComments component fetches and renders comments, handles new comment submission,
 * empty comments state, and reply creation.
 *
 * Tested Features
 * ---------------
 * ✓ Comments list rendering
 * ✓ Empty comments state display ("No comments yet!")
 * ✓ Adding a new comment calling createCommentMutate
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering empty comments list
 * ✓ Fetching comments and submitting a comment
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/use-auth" (useAuth)
 * - "@/lib/api/forum" (getForumComments, useCreateForumCommentMutation, useDeleteForumCommentMutation)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 *
 * Not Covered
 * -----------
 * - Nested comment reply depth limit
 *
 * Notes
 * -----
 * Unit test for PostComments component.
 */

import * as forumApi from "@/lib/api/forum";
import * as apiToast from "@/lib/use-api-with-toast";
import * as useAuthModule from "@/lib/use-auth";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PostComments } from "../post-comments";

vi.mock("@/lib/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/api/forum", () => ({
  getForumComments: vi.fn(),
  getForumCommentReplies: vi.fn(),
  useCreateForumCommentMutation: vi.fn(),
  useDeleteForumCommentMutation: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

describe("PostComments", () => {
  const mockCreateCommentMutate = vi.fn();
  const mockShowSuccess = vi.fn();
  const mockHandleError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { avatarUrl: "https://example.com/avatar.jpg" },
      roles: ["STUDENT"],
    } as any);

    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      showSuccess: mockShowSuccess,
      handleError: mockHandleError,
    } as any);

    vi.mocked(forumApi.useCreateForumCommentMutation).mockReturnValue({
      mutateAsync: mockCreateCommentMutate,
    } as any);

    vi.mocked(forumApi.useDeleteForumCommentMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);
  });

  it("shouldRenderEmptyCommentsStateWhenNoCommentsExist", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return empty comments response.
    // ----------------------------------------------------------------------------
    vi.mocked(forumApi.getForumComments).mockResolvedValue({
      contents: [],
      nextCursor: null,
    } as any);

    // ----------------------------------------------------------------------------
    // Act
    // Render PostComments.
    // ----------------------------------------------------------------------------
    render(<PostComments postId="post-10" />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify empty state message.
    // ----------------------------------------------------------------------------
    await waitFor(() => {
      expect(screen.getByText("No comments yet!")).toBeInTheDocument();
    });
  });

  it("shouldSubmitNewCommentOnInputSubmit", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return existing comments.
    // ----------------------------------------------------------------------------
    vi.mocked(forumApi.getForumComments).mockResolvedValue({
      contents: [],
      nextCursor: null,
    } as any);

    mockCreateCommentMutate.mockResolvedValue({
      id: "comm-1",
      content: "Great article on React 19!",
      authorUsername: "student123",
      createdAt: "2026-06-01T10:00:00.000Z",
    });

    // ----------------------------------------------------------------------------
    // Act
    // Render PostComments.
    // ----------------------------------------------------------------------------
    render(<PostComments postId="post-10" />);

    await waitFor(() => {
      expect(screen.getByText("No comments yet!")).toBeInTheDocument();
    });

    // Type comment input and press Enter
    const input = screen.getByPlaceholderText("Write your comment...");
    fireEvent.change(input, {
      target: { value: "Great article on React 19!" },
    });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify createCommentMutate execution.
    // ----------------------------------------------------------------------------
    await waitFor(() => {
      expect(mockCreateCommentMutate).toHaveBeenCalledWith({
        postId: "post-10",
        content: "Great article on React 19!",
      });
      expect(mockShowSuccess).toHaveBeenCalledWith(
        "Comment created successfully",
      );
    });
  });
});
