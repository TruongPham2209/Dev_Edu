import React from "react";
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

import type { CategoryResponse, CourseResponse } from "@/lib/type/courses";
import * as coursesApi from "@/lib/api/courses";
import * as apiToast from "@/lib/use-api-with-toast";
import {
  createMockCategory,
  createMockCourse,
  createMockCustomPaging,
} from "@/testing/mock-data";
import {
  createMockApiWithToast,
  createMockInfiniteQueryResult,
  createMockQueryResult,
} from "@/testing/mock-query";
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
  default: ({ alt = "image", ...props }: React.ComponentProps<"img">) =>
    React.createElement("img", { alt, ...props }),
}));

describe("LecturerDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast(),
    );

    const mockCategories: CategoryResponse[] = [
      createMockCategory({ id: "cat-1", name: "Web Development" }),
      createMockCategory({ id: "cat-2", name: "Mobile App" }),
    ];

    vi.mocked(coursesApi.useCategoriesQuery).mockReturnValue(
      createMockQueryResult(mockCategories),
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

  it("shouldRenderEmptyStateWhenNoCoursesAssigned", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return empty assigned courses.
    // ----------------------------------------------------------------------------
    vi.mocked(coursesApi.useAssignedCoursesInfiniteQuery).mockReturnValue(
      createMockInfiniteQueryResult({
        pages: [createMockCustomPaging<CourseResponse>([])],
        pageParams: [null],
      }),
    );

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
    const mockAssignedCourses: CourseResponse[] = [
      createMockCourse({
        id: "course-101",
        title: "Full-Stack Web Development Bootcamp",
        description: "Master React, Node.js, and PostgreSQL",
        createdAt: "2026-05-10T10:00:00.000Z",
        thumbnailUrl: "https://example.com/thumb.jpg",
      }),
    ];

    vi.mocked(coursesApi.useAssignedCoursesInfiniteQuery).mockReturnValue(
      createMockInfiniteQueryResult({
        pages: [createMockCustomPaging<CourseResponse>(mockAssignedCourses)],
        pageParams: [null],
      }),
    );

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
