/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/courses/[id]/course-reviews-section.tsx
 *
 * Purpose
 * -------
 * Verify that CourseReviewsSection fetches reviews via useCourseReviewsInfiniteQuery
 * and renders ReviewList component.
 *
 * Tested Features
 * ---------------
 * ✓ Fetching course reviews list from query hook
 * ✓ Passing reviews, rating, and reviewCount to ReviewList
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering course reviews section
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/courses" (useCourseReviewsInfiniteQuery)
 *
 * Not Covered
 * -----------
 * - CSS animation transitions
 *
 * Notes
 * -----
 * Unit test for CourseReviewsSection component.
 */

import * as coursesApi from "@/lib/api/courses";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CourseReviewsSection } from "../course-reviews-section";

vi.mock("@/lib/api/courses", () => ({
  useCourseReviewsInfiniteQuery: vi.fn(),
}));

describe("CourseReviewsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shouldFetchAndRenderCourseReviews", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock reviews infinite query.
    // ----------------------------------------------------------------------------
    const mockReviews = [
      {
        id: "rev-100",
        rating: 5,
        comment: "Excellent course on Next.js 15!",
        userFullName: "John Doe",
        createdAt: "2026-06-15T10:00:00.000Z",
      },
    ];

    vi.mocked(coursesApi.useCourseReviewsInfiniteQuery).mockReturnValue({
      data: { pages: [{ contents: mockReviews }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    } as any);

    // ----------------------------------------------------------------------------
    // Act
    // Render CourseReviewsSection.
    // ----------------------------------------------------------------------------
    render(
      <CourseReviewsSection
        courseId="course-99"
        rating={4.8}
        reviewCount={25}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify review content and rating score render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("4.8")).toBeInTheDocument();
    expect(screen.getByText("25 reviews")).toBeInTheDocument();
    expect(
      screen.getByText("Excellent course on Next.js 15!"),
    ).toBeInTheDocument();
  });
});
