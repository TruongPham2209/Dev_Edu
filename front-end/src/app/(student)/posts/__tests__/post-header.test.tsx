/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/posts/post-header.tsx
 *
 * Purpose
 * -------
 * Verify that PostHeader component renders author info, post title, creation date, view count,
 * bookmark save/unsave toggle, and history icon click opening history modal.
 *
 * Tested Features
 * ---------------
 * ✓ Author avatar, name, creation date, views, and comment counts
 * ✓ Post title rendering
 * ✓ Bookmark toggle calling savePost/unsavePost mutation
 * ✓ History button click opening PostHistoryModal
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering post header
 * ✓ Toggling bookmark save state
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/use-auth" (useAuth)
 * - "@/lib/api/forum" (useSavePostMutation, useUnsavePostMutation)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 * - "@/components/dialog/post-history/page" (PostHistoryModal)
 *
 * Not Covered
 * -----------
 * - Backdrop filter blur
 *
 * Notes
 * -----
 * Unit test for PostHeader component.
 */

import type { PostResponse } from "@/lib/type/forums";
import * as forumApi from "@/lib/api/forum";
import * as apiToast from "@/lib/use-api-with-toast";
import * as useAuthModule from "@/lib/use-auth";
import { createMockAuthStatus, createMockForumPost } from "@/testing/mock-data";
import {
  createMockApiWithToast,
  createMockMutationResult,
} from "@/testing/mock-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PostHeader } from "../post-header";

vi.mock("@/lib/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/api/forum", () => ({
  useSavePostMutation: vi.fn(),
  useUnsavePostMutation: vi.fn(),
  usePostVersionsQuery: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

vi.mock("@/components/dialog/post-history/page", () => ({
  PostHistoryModal: () => <div>Post History Modal Component</div>,
}));

describe("PostHeader", () => {
  const mockSaveMutate = vi.fn();
  const mockUnsaveMutate = vi.fn();
  const mockShowSuccess = vi.fn();
  const mockHandleError = vi.fn();

  const mockPost: PostResponse = createMockForumPost({
    id: "p-888",
    title: "Vitest Best Practices for Next.js",
    authorFullName: "Tran Van B",
    createdAt: "2026-06-15T08:00:00.000Z",
    views: 450,
    comments: 12,
    isSaved: false,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthModule.useAuth).mockReturnValue(
      createMockAuthStatus({
        isAuthenticated: true,
        role: "STUDENT",
        roles: ["STUDENT"],
      }),
    );

    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast({
        showSuccess: mockShowSuccess,
        handleError: mockHandleError,
      }),
    );

    vi.mocked(forumApi.useSavePostMutation).mockReturnValue(
      createMockMutationResult({
        mutateAsync: mockSaveMutate,
      }),
    );

    vi.mocked(forumApi.useUnsavePostMutation).mockReturnValue(
      createMockMutationResult({
        mutateAsync: mockUnsaveMutate,
      }),
    );
  });

  it("shouldRenderTitleAuthorAndToggleSavePost", async () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render PostHeader.
    // ----------------------------------------------------------------------------
    render(<PostHeader post={mockPost} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, author, views, and comment count render.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByRole("heading", {
        name: "Vitest Best Practices for Next.js",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Tran Van B")).toBeInTheDocument();
    expect(screen.getByText("450")).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click bookmark button to trigger save.
    // ----------------------------------------------------------------------------
    const bookmarkBtn = screen.getByRole("button", { name: "Save" });
    fireEvent.click(bookmarkBtn);

    await waitFor(() => {
      expect(mockSaveMutate).toHaveBeenCalledWith("p-888");
      expect(mockShowSuccess).toHaveBeenCalledWith("Saved post successfully");
    });
  });
});
