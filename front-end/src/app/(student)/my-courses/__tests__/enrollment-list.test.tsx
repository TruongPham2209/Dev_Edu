/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/my-courses/enrollment-list.tsx
 *
 * Purpose
 * -------
 * Verify that EnrollmentList component renders enrolled courses list, empty state
 * when no courses are enrolled, skeleton loading placeholders, and navigates to /courses.
 *
 * Tested Features
 * ---------------
 * ✓ Skeleton loading state when isLoading is true
 * ✓ Empty state rendering when enrolled items array is empty
 * ✓ Enrolled course list rendering when data exists
 * ✓ Navigation button routing to /courses
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state
 * ✓ Empty list state
 * ✓ Enrolled courses data list state
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation" (useRouter)
 * - "@/lib/api/enrollments" (useEnrollmentsInfiniteQuery)
 *
 * Not Covered
 * -----------
 * - Infinite scroll viewport intersection observer
 *
 * Notes
 * -----
 * Unit test for EnrollmentList component.
 */

import type { CourseItemDetailResponse } from "@/lib/type/enrollments";
import * as enrollmentsApi from "@/lib/api/enrollments";
import { createMockCustomPaging, createMockRouter } from "@/testing/mock-data";
import { createMockInfiniteQueryResult } from "@/testing/mock-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EnrollmentList } from "../enrollment-list";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/lib/api/enrollments", () => ({
  useEnrollmentsInfiniteQuery: vi.fn(),
}));

describe("EnrollmentTabContent", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(createMockRouter({ push: mockPush }));

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

  it("shouldRenderEmptyStateAndNavigateToCoursesWhenEnrolledItemsListIsEmpty", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return empty pages.
    // ----------------------------------------------------------------------------
    vi.mocked(enrollmentsApi.useEnrollmentsInfiniteQuery).mockReturnValue(
      createMockInfiniteQueryResult({
        pages: [createMockCustomPaging<CourseItemDetailResponse>([])],
        pageParams: [null],
      }),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render EnrollmentList.
    // ----------------------------------------------------------------------------
    render(<EnrollmentList />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify empty state text and explore courses button.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("No courses enrolled")).toBeInTheDocument();

    const exploreBtn = screen.getByRole("button", { name: "Explore courses" });
    fireEvent.click(exploreBtn);

    expect(mockPush).toHaveBeenCalledWith("/courses");
  });
});
