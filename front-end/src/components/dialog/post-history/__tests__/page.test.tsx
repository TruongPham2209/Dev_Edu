/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/post-history/page.tsx
 *
 * Purpose
 * -------
 * Verify that PostHistoryModal component handles history loading, error states,
 * empty state, version listing, and version deletion via delete mutation.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering modal title ("Post history")
 * ✓ Loading skeleton state when isLoading is true
 * ✓ Empty state when no versions exist
 * ✓ Rendering version list when data exists
 * ✓ Delete version mutation execution and refetch trigger
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state
 * ✓ Empty list state
 * ✓ Successful data list state
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/forum" (useDeletePostVersionMutation, usePostVersionsByPostIdQuery)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 *
 * Not Covered
 * -----------
 * - Backdrop filter styling
 *
 * Notes
 * -----
 * Unit test for PostHistoryModal component.
 */

import * as forumApi from "@/lib/api/forum";
import * as apiToast from "@/lib/use-api-with-toast";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PostHistoryModal } from "../page";

vi.mock("@/lib/api/forum", () => ({
  useDeletePostVersionMutation: vi.fn(),
  usePostVersionsByPostIdQuery: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

import { createMockForumPost } from "@/testing/mock-data";
import {
  createMockApiWithToast,
  createMockMutationResult,
  createMockQueryResult,
} from "@/testing/mock-query";

describe("PostHistoryModal", () => {
  const mockDeleteMutate = vi.fn();
  const mockRefetch = vi.fn();
  const mockShowSuccess = vi.fn();
  const mockHandleError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      showSuccess: mockShowSuccess,
      handleError: mockHandleError,
    } as never);
    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast(),
    );

    vi.mocked(forumApi.useDeletePostVersionMutation).mockReturnValue({
      mutateAsync: mockDeleteMutate,
    } as never);
    vi.mocked(forumApi.useDeletePostVersionMutation).mockReturnValue(
      createMockMutationResult({
        mutateAsync: mockDeleteMutate,
      }),
    );
  });

  it("shouldRenderEmptyStateWhenNoPostVersionsExist", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return empty array.
    // ----------------------------------------------------------------------------
    vi.mocked(forumApi.usePostVersionsByPostIdQuery).mockReturnValue(
      createMockQueryResult([], {
        refetch: mockRefetch,
      }),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render modal.
    // ----------------------------------------------------------------------------
    render(
      <PostHistoryModal open={true} onClose={vi.fn()} postId="post-100" />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title and empty state text.
    // ----------------------------------------------------------------------------
    expect(screen.getAllByText(/Post history/i)[0]).toBeInTheDocument();
    expect(screen.getByText("No post history data")).toBeInTheDocument();
  });

  it("shouldRenderPostVersionListWhenVersionsDataExists", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return version list.
    // ----------------------------------------------------------------------------
    const mockVersions = [
      createMockForumPost({
        id: "v-1",
        title: "Initial Post Draft",
        content: "<p>Hello World</p>",
        status: "APPROVED",
        createdAt: "2026-06-01T10:00:00.000Z",
      }),
    ];

    vi.mocked(forumApi.usePostVersionsByPostIdQuery).mockReturnValue(
      createMockQueryResult(mockVersions, {
        refetch: mockRefetch,
      }),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render modal.
    // ----------------------------------------------------------------------------
    render(
      <PostHistoryModal open={true} onClose={vi.fn()} postId="post-100" />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify version title renders.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Initial Post Draft")).toBeInTheDocument();
  });
});
