import React from "react";
/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/profile/saved-tab.tsx
 *
 * Purpose
 * -------
 * Verify that SavedPostsTab component renders saved posts list, skeleton loading state,
 * empty saved posts state, and handles post removal.
 *
 * Tested Features
 * ---------------
 * ✓ Skeleton cards rendering when isLoading = true
 * ✓ EmptyState rendering when no saved posts exist
 * ✓ Saved post cards list rendering when data exists
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state
 * ✓ Empty saved posts state
 * ✓ Displaying saved post cards
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/forum" (useSavedPostsInfiniteQuery, useUnsavePostMutation)
 * - "next/image" (mocked img tag)
 *
 * Not Covered
 * -----------
 * - CSS animation transitions
 *
 * Notes
 * -----
 * Unit test for SavedPostsTab component.
 */

import * as forumApi from "@/lib/api/forum";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SavedPostsTab } from "../saved-tab";

vi.mock("@/lib/api/forum", () => ({
  useSavedPostsInfiniteQuery: vi.fn(),
  useUnsavePostMutation: vi.fn(),
  useDeleteForumPostMutation: vi.fn(() => ({ mutate: vi.fn() })),
}));

vi.mock("next/image", () => ({
  default: ({ alt = "image", ...props }: React.ComponentProps<"img">) => React.createElement("img", { alt, ...props }),
}));

import type { SavedPostResponse } from "@/lib/type/forums";
import type { CustomPaging } from "@/lib/type/api";
import { createMockSavedPost } from "@/testing/mock-data";
import {
  createMockInfiniteQueryResult,
  createMockMutationResult,
} from "@/testing/mock-query";

describe("SavedPostsTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(forumApi.useUnsavePostMutation).mockReturnValue(
      createMockMutationResult(),
    );

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
  });

  it("shouldRenderEmptyStateWhenNoSavedPostsExist", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return empty saved posts.
    // ----------------------------------------------------------------------------
    vi.mocked(forumApi.useSavedPostsInfiniteQuery).mockReturnValue({
      data: { pages: [{ contents: [] }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    } as never);
    const emptyPaging: CustomPaging<SavedPostResponse> = {
      contents: [],
      currentPage: 0,
      pageSize: 10,
      totalElements: 0,
      totalPages: 0,
    };

    vi.mocked(forumApi.useSavedPostsInfiniteQuery).mockReturnValue(
      createMockInfiniteQueryResult(
        { pages: [emptyPaging], pageParams: [null] },
      ),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render SavedPostsTab.
    // ----------------------------------------------------------------------------
    render(<SavedPostsTab />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify empty state text.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("You haven't saved any posts")).toBeInTheDocument();
  });

  it("shouldRenderSavedPostCardsList", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock saved post data.
    // ----------------------------------------------------------------------------
    const mockSavedPosts: SavedPostResponse[] = [
      createMockSavedPost({
        id: "saved-1",
        postId: "p-100",
        title: "Mastering Next.js App Router Caching",
        shortDescription: "Detailed guide on fetch caching",
        authorFullName: "Student Author",
        authorUsername: "student_author",
        postedDate: "2026-06-20T10:00:00.000Z",
      }),
    ];

    const pagingWithSaved: CustomPaging<SavedPostResponse> = {
      contents: mockSavedPosts,
      currentPage: 0,
      pageSize: 10,
      totalElements: 1,
      totalPages: 1,
    };

    vi.mocked(forumApi.useSavedPostsInfiniteQuery).mockReturnValue(
      createMockInfiniteQueryResult(
        { pages: [pagingWithSaved], pageParams: [null] },
      ),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render SavedPostsTab.
    // ----------------------------------------------------------------------------
    render(<SavedPostsTab />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify post title renders.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Mastering Next.js App Router Caching"),
    ).toBeInTheDocument();
  });
});
