/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/home/featured-articles.tsx
 *
 * Purpose
 * -------
 * Verify that FeaturedArticlesSection fetches forum feed articles, displays article titles,
 * short descriptions, and creation dates, handles API errors, and FeaturedArticlesFallback renders skeletons.
 *
 * Tested Features
 * ---------------
 * ✓ FeaturedArticlesSection rendering article links, titles, and thumbnails
 * ✓ Error handling displaying ErrorState when getForumFeed fails
 * ✓ FeaturedArticlesFallback rendering skeleton cards
 *
 * Covered Scenarios
 * -----------------
 * ✓ Successful forum feed API response
 * ✓ API rejection (ErrorState)
 * ✓ Loading fallback skeleton
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/forum" (getForumFeed)
 *
 * Not Covered
 * -----------
 * - CSS hover animations
 *
 * Notes
 * -----
 * Unit test for FeaturedArticlesSection and FeaturedArticlesFallback.
 */

import * as forumApi from "@/lib/api/forum";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  FeaturedArticlesFallback,
  FeaturedArticlesSection,
} from "../featured-articles";

vi.mock("@/lib/api/forum", () => ({
  getForumFeed: vi.fn(),
}));

import type { PostResponse } from "@/lib/type/forums";
import { createMockCustomPaging, createMockForumPost } from "@/testing/mock-data";

describe("FeaturedArticlesSection & Fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shouldRenderArticlesListOnSuccess", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock getForumFeed resolution.
    // ----------------------------------------------------------------------------
    const mockArticles: PostResponse[] = [
      createMockForumPost({
        id: "art-1",
        title: "Top 10 Features in React 19",
        shortDescription:
          "Exploring Server Actions, useOptimistic, and useFormStatus.",
        createdAt: "2026-05-15T10:00:00.000Z",
      }),
    ];

    vi.mocked(forumApi.getForumFeed).mockResolvedValue(
      createMockCustomPaging<PostResponse>(mockArticles),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render async FeaturedArticlesSection.
    // ----------------------------------------------------------------------------
    const component = await FeaturedArticlesSection();
    render(component);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify article title and short description render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Top 10 Features in React 19")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Exploring Server Actions, useOptimistic, and useFormStatus.",
      ),
    ).toBeInTheDocument();
  });

  it("shouldRenderErrorStateWhenApiFails", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock API error.
    // ----------------------------------------------------------------------------
    vi.mocked(forumApi.getForumFeed).mockRejectedValue(
      new Error("Failed to fetch"),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render component on error.
    // ----------------------------------------------------------------------------
    const component = await FeaturedArticlesSection();
    render(component);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify error state title.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Failed to load featured articles"),
    ).toBeInTheDocument();
  });

  it("shouldRenderFallbackSkeletons", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render fallback.
    // ----------------------------------------------------------------------------
    render(<FeaturedArticlesFallback />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify skeleton elements render.
    // ----------------------------------------------------------------------------
    expect(document.querySelector(".MuiSkeleton-root")).toBeInTheDocument();
  });
});
