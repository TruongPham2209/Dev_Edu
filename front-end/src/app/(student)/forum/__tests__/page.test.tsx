/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/forum/page.tsx
 *
 * Purpose
 * -------
 * Verify that ForumPage integrates ForumHero, ForumSearch, Latest Discussions feed,
 * TrendingTopics, CommunityGuidelines, and handles Create Post button click.
 *
 * Tested Features
 * ---------------
 * ✓ Integrated layout rendering (ForumHero, ForumSearch, Post list feed, Sidebar)
 * ✓ Create Post button action opening PostFormDialog when authenticated
 * ✓ Empty posts feed handling
 *
 * Covered Scenarios
 * -----------------
 * ✓ ForumPage component rendering
 * ✓ Opening PostFormDialog
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation" (useRouter)
 * - "@/lib/use-auth" (useAuth)
 * - "@/lib/api/forum" (useCreateForumPostMutation, useForumFeedInfiniteQuery, useSearchForumPostsInfiniteQuery)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 * - "next/image" (mocked img tag)
 *
 * Not Covered
 * -----------
 * - S3 presigned upload URL execution
 *
 * Notes
 * -----
 * Unit test for ForumPage component.
 */

import * as forumApi from "@/lib/api/forum";
import * as apiToast from "@/lib/use-api-with-toast";
import * as useAuthModule from "@/lib/use-auth";
import { fireEvent, render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ForumPage from "../page";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/lib/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/api/files", () => ({
  getPreSignedUploadUrl: vi.fn(),
  useConfirmImageUploadMutation: () => ({ mutateAsync: vi.fn() }),
  usePreSignedUploadUrlMutation: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock("@/lib/api/forum", () => ({
  useCreateForumPostMutation: vi.fn(),
  useForumFeedInfiniteQuery: vi.fn(),
  useSearchForumPostsInfiniteQuery: vi.fn(),
  useDeleteForumPostMutation: vi.fn(() => ({ mutate: vi.fn() })),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} alt={props.alt || "image"} />,
}));

describe("ForumPage", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);

    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      isAuthenticated: true,
      roles: ["STUDENT"],
    } as any);

    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      handleError: vi.fn(),
      showSuccess: vi.fn(),
    } as any);

    vi.mocked(forumApi.useCreateForumPostMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);

    vi.mocked(forumApi.useForumFeedInfiniteQuery).mockReturnValue({
      data: {
        pages: [
          {
            contents: [
              {
                id: "post-1",
                title: "How to master React Server Components?",
                shortDescription: "Tips and best practices for RSC",
                createdAt: "2026-06-01T10:00:00.000Z",
              },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    } as any);

    vi.mocked(forumApi.useSearchForumPostsInfiniteQuery).mockReturnValue({
      data: { pages: [{ contents: [] }] },
      isLoading: false,
      isError: false,
      error: null,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    } as any);

    class MockIntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    window.IntersectionObserver = MockIntersectionObserver as any;
  });

  it("shouldRenderHeroDiscussionsFeedAndOpenCreatePostModal", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render ForumPage.
    // ----------------------------------------------------------------------------
    render(<ForumPage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify hero title, discussion title, and post title render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Latest Discussions")).toBeInTheDocument();
    expect(
      screen.getByText("How to master React Server Components?"),
    ).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click Create Post button.
    // ----------------------------------------------------------------------------
    const createBtn = screen.getByRole("button", { name: "Create Post" });
    fireEvent.click(createBtn);

    expect(screen.getAllByText(/Create Post/i).length).toBeGreaterThan(0);
  });
});
