/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/posts/related-posts-sidebar.tsx
 *
 * Purpose
 * -------
 * Verify that RelatedPostsSidebar component fetches related posts and renders PostCards list,
 * or empty state when no related posts exist.
 *
 * Tested Features
 * ---------------
 * ✓ Related Posts header rendering
 * ✓ PostCards list rendering when data exists
 * ✓ EmptyState rendering when no related posts exist
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering related posts list
 * ✓ Handling empty related posts
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/forum" (getRelatedPosts)
 * - "next/image" (mocked img tag)
 *
 * Not Covered
 * -----------
 * - Sticky sidebar positioning
 *
 * Notes
 * -----
 * Unit test for RelatedPostsSidebar component.
 */

import * as forumApi from "@/lib/api/forum";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RelatedPostsSidebar } from "../related-posts-sidebar";

vi.mock("@/lib/api/forum", () => ({
  getRelatedPosts: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} alt={props.alt || "image"} />,
}));

describe("RelatedPostsSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shouldRenderRelatedPostsListOnSuccess", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock getRelatedPosts resolution.
    // ----------------------------------------------------------------------------
    const mockRelated = [
      {
        id: "rel-1",
        title: "Clean Architecture in Spring Boot",
        shortDescription: "Decoupling business domain logic",
        createdAt: "2026-05-10T10:00:00.000Z",
      },
    ];

    vi.mocked(forumApi.getRelatedPosts).mockResolvedValue(mockRelated as any);

    // ----------------------------------------------------------------------------
    // Act
    // Render async RelatedPostsSidebar.
    // ----------------------------------------------------------------------------
    const component = await RelatedPostsSidebar({ postId: "post-100" });
    render(component);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify Related Posts title and post card title render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Related Posts")).toBeInTheDocument();
    expect(
      screen.getByText("Clean Architecture in Spring Boot"),
    ).toBeInTheDocument();
  });

  it("shouldRenderEmptyStateWhenNoRelatedPostsExist", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock empty resolution.
    // ----------------------------------------------------------------------------
    vi.mocked(forumApi.getRelatedPosts).mockResolvedValue([]);

    // ----------------------------------------------------------------------------
    // Act
    // Render async RelatedPostsSidebar.
    // ----------------------------------------------------------------------------
    const component = await RelatedPostsSidebar({ postId: "post-100" });
    render(component);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify empty state text.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("No related posts")).toBeInTheDocument();
  });
});
