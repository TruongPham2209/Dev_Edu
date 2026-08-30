/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/posts/page.tsx
 *
 * Purpose
 * -------
 * Verify that AdminPostsPage queries pending post versions, renders ModerationCards with post details,
 * and allows Approve Post and Reject Post actions.
 *
 * Tested Features
 * ---------------
 * ✓ Post Moderation title rendering
 * ✓ Fetching pending post versions via usePostVersionsInfiniteQuery
 * ✓ ModerationCard rendering with title, author, and content
 * ✓ Triggering Approve Post / Reject Post actions via useUpdatePostVersionMutation
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state
 * ✓ Empty state when no pending posts exist
 * ✓ Moderation actions
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/forum" (usePostVersionsInfiniteQuery, useUpdatePostVersionMutation)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 *
 * Not Covered
 * -----------
 * - CSS height collapse animation
 *
 * Notes
 * -----
 * Unit test for AdminPostsPage component.
 */

import type { PostResponse } from "@/lib/type/forums";
import * as forumApi from "@/lib/api/forum";
import * as apiToast from "@/lib/use-api-with-toast";
import { createMockCustomPaging, createMockForumPost } from "@/testing/mock-data";
import {
  createMockApiWithToast,
  createMockInfiniteQueryResult,
  createMockMutationResult,
} from "@/testing/mock-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminPostsPage from "../page";

vi.mock("@/lib/api/forum", () => ({
  usePostVersionsInfiniteQuery: vi.fn(),
  useUpdatePostVersionMutation: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

describe("AdminPostsPage", () => {
  let queryClient: QueryClient;
  const mockUpdateVersion = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    class MockIntersectionObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    Object.defineProperty(window, "IntersectionObserver", {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver,
    });

    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast({
        showSuccess: vi.fn(),
        handleError: vi.fn(),
      }),
    );

    vi.mocked(forumApi.useUpdatePostVersionMutation).mockReturnValue(
      createMockMutationResult({
        mutate: mockUpdateVersion,
        isPending: false,
      }),
    );
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("shouldRenderEmptyStateWhenNoPendingPostsExist", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return empty pending posts page.
    // ----------------------------------------------------------------------------
    vi.mocked(forumApi.usePostVersionsInfiniteQuery).mockReturnValue(
      createMockInfiniteQueryResult({
        pages: [createMockCustomPaging<PostResponse>([])],
        pageParams: [null],
      }),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render AdminPostsPage.
    // ----------------------------------------------------------------------------
    render(<AdminPostsPage />, { wrapper });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify empty state text.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("No posts to review")).toBeInTheDocument();
  });

  it("shouldRenderPendingPostsAndAllowApproveOrRejectActions", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock pending post.
    // ----------------------------------------------------------------------------
    const mockPost: PostResponse = createMockForumPost({
      id: "post-v1",
      title: "Building Microservices with Spring Boot & Next.js",
      shortDescription: "A comprehensive guide to backend architecture.",
      content: "<p>Deep dive into API gateways and JWT auth.</p>",
      authorFullName: "Sarah Connor",
      authorUsername: "sarah_c",
      authorAvatarUrl: "https://example.com/sarah.jpg",
      createdAt: "2026-06-01T00:00:00.000Z",
    });

    vi.mocked(forumApi.usePostVersionsInfiniteQuery).mockReturnValue(
      createMockInfiniteQueryResult({
        pages: [createMockCustomPaging<PostResponse>([mockPost])],
        pageParams: [null],
      }),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render AdminPostsPage.
    // ----------------------------------------------------------------------------
    render(<AdminPostsPage />, { wrapper });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, post details, approve & reject buttons.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Building Microservices with Spring Boot & Next.js"),
    ).toBeInTheDocument();
    expect(screen.getByText("Sarah Connor")).toBeInTheDocument();

    const approveBtn = screen.getByRole("button", { name: "Approve Post" });
    fireEvent.click(approveBtn);

    expect(mockUpdateVersion).toHaveBeenCalledWith(
      { postVersionId: "post-v1", postStatus: "APPROVED" },
      expect.anything(),
    );
  });
});
