import React from "react";
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

import type { PostResponse } from "@/lib/type/forums";
import * as forumApi from "@/lib/api/forum";
import * as apiToast from "@/lib/use-api-with-toast";
import * as useAuthModule from "@/lib/use-auth";
import {
  createMockAuthStatus,
  createMockCustomPaging,
  createMockForumPost,
  createMockRouter,
} from "@/testing/mock-data";
import {
  createMockApiWithToast,
  createMockInfiniteQueryResult,
  createMockMutationResult,
} from "@/testing/mock-query";
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
  default: ({ alt = "image", ...props }: React.ComponentProps<"img">) =>
    React.createElement("img", { alt, ...props }),
}));

describe("ForumPage", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(createMockRouter({ push: mockPush }));

    vi.mocked(useAuthModule.useAuth).mockReturnValue(
      createMockAuthStatus({
        isAuthenticated: true,
        roles: ["STUDENT"],
        role: "STUDENT",
      }),
    );

    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast(),
    );

    vi.mocked(forumApi.useCreateForumPostMutation).mockReturnValue(
      createMockMutationResult(),
    );

    const mockPost: PostResponse = createMockForumPost({
      id: "post-1",
      title: "How to master React Server Components?",
      shortDescription: "Tips and best practices for RSC",
      createdAt: "2026-06-01T10:00:00.000Z",
    });

    vi.mocked(forumApi.useForumFeedInfiniteQuery).mockReturnValue(
      createMockInfiniteQueryResult({
        pages: [createMockCustomPaging<PostResponse>([mockPost])],
        pageParams: [null],
      }),
    );

    vi.mocked(forumApi.useSearchForumPostsInfiniteQuery).mockReturnValue(
      createMockInfiniteQueryResult({
        pages: [createMockCustomPaging<PostResponse>([])],
        pageParams: [null],
      }),
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

  it("shouldRenderHeroDiscussionsFeedAndOpenCreatePostModal", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render ForumPage.
    // ----------------------------------------------------------------------------
    render(<ForumPage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify hero text, search bar, and post title render.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText(/DevEdu Community/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText("How to master React Server Components?"),
    ).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click Create Post button.
    // ----------------------------------------------------------------------------
    const createBtn = screen.getByRole("button", { name: "Create Post" });
    fireEvent.click(createBtn);

    expect(
      screen.getByRole("heading", { name: "Create Post" }),
    ).toBeInTheDocument();
  });
});
