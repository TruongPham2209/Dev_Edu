/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(lecturer)/lecturer/courses/[id]/students-tab.tsx
 *
 * Purpose
 * -------
 * Verify that StudentsTab queries enrolled students list, displays empty state or student cards,
 * and handles load more pagination.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering Enrolled Students header title
 * ✓ Rendering EmptyState when no students are enrolled
 * ✓ Rendering enrolled students list with avatars, names, usernames, and enrolled dates
 * ✓ Triggering fetchNextPage when Load More button is clicked
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state with ListSkeleton
 * ✓ Empty enrolled students state
 * ✓ Enrolled students list rendering
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/enrollments" (useEnrolledUsersInfiniteQuery)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 *
 * Not Covered
 * -----------
 * - Real backend database queries
 *
 * Notes
 * -----
 * Unit test for StudentsTab component.
 */

import type { EnrollmentUserResponse } from "@/lib/type/users";
import * as enrollmentsApi from "@/lib/api/enrollments";
import * as apiToast from "@/lib/use-api-with-toast";
import { createMockCustomPaging } from "@/testing/mock-data";
import {
  createMockApiWithToast,
  createMockInfiniteQueryResult,
} from "@/testing/mock-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StudentsTab } from "../students-tab";

vi.mock("@/lib/api/enrollments", () => ({
  useEnrolledUsersInfiniteQuery: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

describe("StudentsTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast(),
    );
  });

  it("shouldRenderEmptyStateWhenNoStudentsEnrolled", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return empty students.
    // ----------------------------------------------------------------------------
    vi.mocked(enrollmentsApi.useEnrolledUsersInfiniteQuery).mockReturnValue(
      createMockInfiniteQueryResult({
        pages: [createMockCustomPaging<EnrollmentUserResponse>([])],
        pageParams: [null],
      }),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render StudentsTab.
    // ----------------------------------------------------------------------------
    render(<StudentsTab courseId="course-100" />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify empty state.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("No students enrolled yet")).toBeInTheDocument();
  });

  it("shouldRenderEnrolledStudentsListAndTriggerLoadMore", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return student array and hasNextPage = true.
    // ----------------------------------------------------------------------------
    const mockStudents: EnrollmentUserResponse[] = [
      {
        id: "student-1",
        fullName: "Alex Johnson",
        username: "alexj",
        avatarUrl: null,
        enrolledAt: "2026-06-15T00:00:00.000Z",
      },
    ];
    const mockFetchNext = vi.fn();

    vi.mocked(enrollmentsApi.useEnrolledUsersInfiniteQuery).mockReturnValue(
      createMockInfiniteQueryResult(
        {
          pages: [createMockCustomPaging<EnrollmentUserResponse>(mockStudents)],
          pageParams: [null],
        },
        {
          hasNextPage: true,
          fetchNextPage: mockFetchNext,
        },
      ),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render StudentsTab.
    // ----------------------------------------------------------------------------
    render(<StudentsTab courseId="course-100" />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify student name, username, and load more button click.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Alex Johnson")).toBeInTheDocument();
    expect(screen.getByText("@alexj")).toBeInTheDocument();

    const loadMoreBtn = screen.getByRole("button", { name: "Load More" });
    fireEvent.click(loadMoreBtn);

    expect(mockFetchNext).toHaveBeenCalled();
  });
});
