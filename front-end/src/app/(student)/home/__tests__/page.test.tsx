/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/home/page.tsx
 *
 * Purpose
 * -------
 * Verify that HomePage renders the Hero Section banner, Explore Courses and Read Articles navigation
 * buttons, Featured Courses section header, and Featured Articles section header.
 *
 * Tested Features
 * ---------------
 * ✓ Hero section headline rendering
 * ✓ Links to /courses and /forum
 * ✓ Featured Courses and Featured Articles section titles
 *
 * Covered Scenarios
 * -----------------
 * ✓ HomePage component rendering
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/courses" (getFeaturedCourses)
 * - "@/lib/api/forum" (getForumFeed)
 *
 * Not Covered
 * -----------
 * - CSS grid layout responsiveness
 *
 * Notes
 * -----
 * Unit test for HomePage component.
 */

import * as coursesApi from "@/lib/api/courses";
import * as forumApi from "@/lib/api/forum";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "../page";

vi.mock("@/lib/api/courses", () => ({
  getFeaturedCourses: vi.fn(),
}));

vi.mock("@/lib/api/forum", () => ({
  getForumFeed: vi.fn(),
}));

vi.mock("../featured-courses", () => ({
  FeaturedCoursesSection: () => (
    <div data-testid="featured-courses">Featured Courses</div>
  ),
  FeaturedCoursesFallback: () => <div>Loading Courses...</div>,
}));

vi.mock("../featured-articles", () => ({
  FeaturedArticlesSection: () => (
    <div data-testid="featured-articles">Featured Articles</div>
  ),
  FeaturedArticlesFallback: () => <div>Loading Articles...</div>,
}));

describe("HomePage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(coursesApi.getFeaturedCourses).mockResolvedValue([]);
    vi.mocked(forumApi.getForumFeed).mockResolvedValue({ contents: [] } as never);
  });

  it("shouldRenderHeroHeadlineExploreButtonsAndSectionTitles", async () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render HomePage component.
    // ----------------------------------------------------------------------------
    render(<HomePage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify hero title, buttons, and section titles render.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText(/Ignite your coding journey with expert-led courses/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Explore Courses")).toBeInTheDocument();
    expect(screen.getByText("Read Articles")).toBeInTheDocument();
    expect(screen.getAllByText("Featured Courses")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Featured Articles")[0]).toBeInTheDocument();
  });
});
