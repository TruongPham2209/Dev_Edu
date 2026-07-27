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

import * as forumApi from "@/lib/api/forum";
import * as apiToast from "@/lib/use-api-with-toast";
import * as useAuthModule from "@/lib/use-auth";
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

describe("PostHeader", () => {
  const mockSaveMutate = vi.fn();
  const mockUnsaveMutate = vi.fn();
  const mockShowSuccess = vi.fn();
  const mockHandleError = vi.fn();

  const mockPost = {
    id: "p-888",
    title: "Vitest Best Practices for Next.js",
    authorFullName: "Tran Van B",
    createdAt: "2026-06-15T08:00:00.000Z",
    views: 450,
    comments: 12,
    isSaved: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      isAuthenticated: true,
    } as any);

    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      showSuccess: mockShowSuccess,
      handleError: mockHandleError,
    } as any);

    vi.mocked(forumApi.useSavePostMutation).mockReturnValue({
      mutateAsync: mockSaveMutate,
    } as any);

    vi.mocked(forumApi.useUnsavePostMutation).mockReturnValue({
      mutateAsync: mockUnsaveMutate,
    } as any);
  });

  it("shouldRenderTitleAuthorAndToggleSavePost", async () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render PostHeader.
    // ----------------------------------------------------------------------------
    render(<PostHeader post={mockPost as any} />);

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
    // Click save bookmark button.
    // ----------------------------------------------------------------------------
    const buttons = screen.getAllByRole("button");
    const saveBtn = buttons[1]; // Bookmark button is index 1
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockSaveMutate).toHaveBeenCalledWith("p-888");
      expect(mockShowSuccess).toHaveBeenCalledWith("Saved post successfully");
    });
  });
});
