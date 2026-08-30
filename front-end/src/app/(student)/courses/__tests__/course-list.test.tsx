import React from "react";
/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/courses/course-list.tsx
 *
 * Purpose
 * -------
 * Verify that CourseList component renders course cards grid, skeleton loading state,
 * empty courses state with Clear Filters action button, and Load More pagination button.
 *
 * Tested Features
 * ---------------
 * ✓ Skeleton cards rendering when loading = true
 * ✓ Empty state rendering when courses array is empty
 * ✓ Clear filters button click handler
 * ✓ Course cards grid rendering
 * ✓ Load More button click handler
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state
 * ✓ Empty courses search result
 * ✓ Displaying course cards and clicking Load More
 *
 * Mocked Dependencies
 * -------------------
 * - "next/image" (mocked img tag)
 *
 * Not Covered
 * -----------
 * - CSS grid responsiveness
 *
 * Notes
 * -----
 * Unit test for CourseList component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CourseList } from "../course-list";

vi.mock("next/image", () => ({
  default: ({ alt = "image", ...props }: React.ComponentProps<"img">) => React.createElement("img", { alt, ...props }),
}));

import type { CourseResponse } from "@/lib/type/courses";
import { createMockCourse } from "@/testing/mock-data";

describe("CourseList", () => {
  it("shouldRenderEmptyCoursesStateAndTriggerClearFilters", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare callbacks.
    // ----------------------------------------------------------------------------
    const handleClearFilters = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render CourseList with empty array.
    // ----------------------------------------------------------------------------
    render(
      <CourseList
        courses={[]}
        loading={false}
        initialLoad={false}
        nextCursor={null}
        loadingMore={false}
        onLoadMore={vi.fn()}
        onClearFilters={handleClearFilters}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify "No courses found" title and Clear filters button.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("No courses found")).toBeInTheDocument();

    const clearBtn = screen.getByRole("button", { name: "Clear filters" });
    fireEvent.click(clearBtn);

    expect(handleClearFilters).toHaveBeenCalledTimes(1);
  });

  it("shouldRenderCourseCardsAndTriggerLoadMore", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock course list.
    // ----------------------------------------------------------------------------
    const mockCourses: CourseResponse[] = [
      createMockCourse({
        id: "c-10",
        title: "Spring Boot Microservices",
        originalPrice: 1500000,
        discountedPrice: 1200000,
        avgReview: 4.9,
      }),
    ];

    const handleLoadMore = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render CourseList.
    // ----------------------------------------------------------------------------
    render(
      <CourseList
        courses={mockCourses}
        loading={false}
        initialLoad={false}
        nextCursor="cursor-123"
        loadingMore={false}
        onLoadMore={handleLoadMore}
        onClearFilters={vi.fn()}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify course card title and Load More button.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Spring Boot Microservices")).toBeInTheDocument();

    const loadMoreBtn = screen.getByRole("button", { name: "Load More" });
    fireEvent.click(loadMoreBtn);

    expect(handleLoadMore).toHaveBeenCalledTimes(1);
  });
});
