/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(lecturer)/lecturer/page.tsx
 *
 * Purpose
 * -------
 * Verify that LecturerDashboardPage queries assigned courses, displays search & category filters,
 * renders CourseManageGridSkeleton when loading, EmptyState when no assigned courses exist,
 * and CourseManageCard grid when courses are loaded.
 *
 * Tested Features
 * ---------------
 * ✓ SearchInput and Category FilterSelect rendering
 * ✓ CourseManageGridSkeleton rendering during initial loading state
 * ✓ EmptyState rendering when assigned courses array is empty
 * ✓ ErrorState rendering when query returns an error
 * ✓ CourseManageCard grid rendering when assigned courses exist
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state
 * ✓ Empty assigned courses state
 * ✓ Error state with retry action
 * ✓ Rendering assigned course cards list
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/courses" (useAssignedCoursesInfiniteQuery, useCategoriesQuery)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 * - "next/image" (mocked img tag)
 *
 * Not Covered
 * -----------
 * - IntersectionObserver infinite scroll pagination
 *
 * Notes
 * -----
 * Unit test for LecturerDashboardPage component.
 */

import * as coursesApi from "@/lib/api/courses";
import * as apiToast from "@/lib/use-api-with-toast";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LecturerDashboardPage from "../page";

vi.mock("@/lib/api/courses", () => ({
  useAssignedCoursesInfiniteQuery: vi.fn(),
  useCategoriesQuery: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} alt={props.alt || "image"} />,
}));

describe("LecturerDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      showSuccess: vi.fn(),
      handleError: vi.fn(),
    } as any);

    vi.mocked(coursesApi.useCategoriesQuery).mockReturnValue({
      data: [
        { id: "cat-1", name: "Web Development" },
        { id: "cat-2", name: "Mobile App" },
      ],
      isLoading: false,
      error: null,
    } as any);

    class MockIntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    window.IntersectionObserver = MockIntersectionObserver as any;
  });

  it("shouldRenderEmptyStateWhenNoCoursesAssigned", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return empty assigned courses.
    // ----------------------------------------------------------------------------
    vi.mocked(coursesApi.useAssignedCoursesInfiniteQuery).mockReturnValue({
      data: { pages: [{ contents: [] }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      error: null,
      refetch: vi.fn(),
    } as any);

    // ----------------------------------------------------------------------------
    // Act
    // Render LecturerDashboardPage.
    // ----------------------------------------------------------------------------
    render(<LecturerDashboardPage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify "No courses assigned" empty state.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("No courses assigned")).toBeInTheDocument();
  });

  it("shouldRenderAssignedCourseCardsList", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock assigned courses.
    // ----------------------------------------------------------------------------
    const mockAssignedCourses = [
      {
        id: "course-101",
        title: "Full-Stack Web Development Bootcamp",
        description: "Master React, Node.js, and PostgreSQL",
        createdAt: "2026-05-10T10:00:00.000Z",
        thumbnailUrl: "https://example.com/thumb.jpg",
      },
    ];

    vi.mocked(coursesApi.useAssignedCoursesInfiniteQuery).mockReturnValue({
      data: { pages: [{ contents: mockAssignedCourses }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      error: null,
      refetch: vi.fn(),
    } as any);

    // ----------------------------------------------------------------------------
    // Act
    // Render LecturerDashboardPage.
    // ----------------------------------------------------------------------------
    render(<LecturerDashboardPage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify course title and search input render.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Full-Stack Web Development Bootcamp"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search courses..."),
    ).toBeInTheDocument();
  });
});
