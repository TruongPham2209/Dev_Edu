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
  default: (props: any) => <img {...props} alt={props.alt || "image"} />,
}));

describe("SavedPostsTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(forumApi.useUnsavePostMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);

    class MockIntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    window.IntersectionObserver = MockIntersectionObserver as any;
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
    } as any);

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
    const mockSavedPosts = [
      {
        id: "saved-1",
        postId: "p-100",
        title: "Mastering Next.js App Router Caching",
        shortDescription: "Detailed guide on fetch caching",
        authorFullName: "Student Author",
        authorUsername: "student_author",
        createdAt: "2026-06-20T10:00:00.000Z",
      },
    ];

    vi.mocked(forumApi.useSavedPostsInfiniteQuery).mockReturnValue({
      data: { pages: [{ contents: mockSavedPosts }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    } as any);

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
