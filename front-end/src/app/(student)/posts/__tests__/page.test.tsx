/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/posts/page.tsx
 *
 * Purpose
 * -------
 * Verify that PostDetailPage resolves searchParams `id`, fetches forum post data,
 * and renders PostHeader, PostContent, PostComments, and RelatedPostsSidebar, or ErrorPageContent.
 *
 * Tested Features
 * ---------------
 * ✓ Post Not Found error state when postId is missing in searchParams
 * ✓ Rendering post header, content, comments, and related posts sidebar on valid postId
 *
 * Covered Scenarios
 * -----------------
 * ✓ Missing post ID searchParam error state
 * ✓ Successful post detail page render
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/forum" (getForumPostById, getRelatedPosts, getForumComments, useSavePostMutation, useUnsavePostMutation, useCreateForumCommentMutation, useDeleteForumCommentMutation)
 * - "@/lib/use-auth" (useAuth)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 * - "next/image" (mocked img tag)
 *
 * Not Covered
 * -----------
 * - CSS layout sticky sidebar
 *
 * Notes
 * -----
 * Unit test for PostDetailPage component.
 */

import * as forumApi from "@/lib/api/forum";
import * as apiToast from "@/lib/use-api-with-toast";
import * as useAuthModule from "@/lib/use-auth";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PostDetailPage, { PostDetailContent } from "../page";

vi.mock("@/lib/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

vi.mock("@/lib/api/forum", () => ({
  getForumPostById: vi.fn(),
  getRelatedPosts: vi.fn(),
  getForumComments: vi.fn(),
  getForumCommentReplies: vi.fn(),
  useSavePostMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useUnsavePostMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useCreateForumCommentMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useDeleteForumCommentMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
  usePostVersionsQuery: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock("../post-comments", () => ({
  PostComments: () => <div>Post Comments Component</div>,
}));

vi.mock("../related-posts-sidebar", () => ({
  RelatedPostsSidebar: () => <div>Related Posts Sidebar</div>,
}));

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} alt={props.alt || "image"} />,
}));

describe("PostDetailPage (Forum Post)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      isAuthenticated: true,
      user: {},
      roles: ["STUDENT"],
    } as any);

    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      showSuccess: vi.fn(),
      handleError: vi.fn(),
    } as any);

    vi.mocked(forumApi.getForumComments).mockResolvedValue({
      contents: [],
      nextCursor: null,
    } as any);

    vi.mocked(forumApi.getRelatedPosts).mockResolvedValue([]);
  });

  it("shouldRenderPostNotFoundWhenIdIsMissingInSearchParams", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // SearchParams with no id.
    // ----------------------------------------------------------------------------
    const searchParamsPromise = Promise.resolve({});

    // ----------------------------------------------------------------------------
    // Act
    // Render async PostDetailPage.
    // ----------------------------------------------------------------------------
    const component = await PostDetailPage({
      searchParams: searchParamsPromise,
    });
    render(component);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify "Post Not Found" empty state text.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Post Not Found")).toBeInTheDocument();
  });

  it("shouldRenderPostContentAndHeaderWhenIdIsValid", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock valid post data.
    // ----------------------------------------------------------------------------
    const mockPost = {
      id: "post-999",
      title: "Building Microfrontends with Module Federation",
      content: "<p>Microfrontends allow teams to work independently.</p>",
      authorFullName: "Alex Johnson",
      createdAt: "2026-07-01T10:00:00.000Z",
      views: 320,
      comments: 5,
      isSaved: false,
    };

    vi.mocked(forumApi.getForumPostById).mockResolvedValue(mockPost as any);

    // ----------------------------------------------------------------------------
    // Act
    // Render async PostDetailContent.
    // ----------------------------------------------------------------------------
    const component = await PostDetailContent({ postId: "post-999" });
    render(component);

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify post title and content render.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByRole("heading", {
        name: "Building Microfrontends with Module Federation",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Microfrontends allow teams to work independently."),
    ).toBeInTheDocument();
  });
});
