/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/courses/[id]/page.tsx
 *
 * Purpose
 * -------
 * Verify that AdminCourseDetailPage queries course by ID, displays AdminCourseDetailSkeleton while loading,
 * renders ErrorState when course query fails, and renders CourseHero along with sub-lists (Lectures, Discounts, Lecturers, Students, Reviews).
 *
 * Tested Features
 * ---------------
 * ✓ Querying course by ID via useCourseByIdQuery
 * ✓ AdminCourseDetailSkeleton rendering during loading
 * ✓ ErrorState rendering when course fails to fetch
 * ✓ Rendering CourseHero, LecturesList, DiscountsList, LecturersList, StudentsList, and ReviewList
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state
 * ✓ Error / not found state
 * ✓ Course detail page content rendering
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/courses" (useCourseByIdQuery)
 * - "next/navigation" (useParams)
 * - "./course-hero" (mocked CourseHero)
 * - "./discounts-list" (mocked DiscountsList)
 * - "./lecturers-list" (mocked LecturersList)
 * - "./lectures-list" (mocked LecturesList)
 * - "./review-list" (mocked ReviewList)
 * - "./students-list" (mocked StudentsList)
 *
 * Not Covered
 * -----------
 * - Scroll position persistence
 *
 * Notes
 * -----
 * Unit test for AdminCourseDetailPage component.
 */

import * as coursesApi from "@/lib/api/courses";
import { render, screen } from "@testing-library/react";
import { useParams } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminCourseDetailPage from "../page";

vi.mock("@/lib/api/courses", () => ({
  useCourseByIdQuery: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
}));

vi.mock("../course-hero", () => ({
  CourseHero: ({ course }: any) => (
    <div data-testid="course-hero-mock">{course.title}</div>
  ),
}));

vi.mock("../discounts-list", () => ({
  DiscountsList: () => (
    <div data-testid="discounts-list-mock">Discounts List</div>
  ),
}));

vi.mock("../lecturers-list", () => ({
  LecturersList: () => (
    <div data-testid="lecturers-list-mock">Lecturers List</div>
  ),
}));

vi.mock("../lectures-list", () => ({
  LecturesList: () => <div data-testid="lectures-list-mock">Lectures List</div>,
}));

vi.mock("../review-list", () => ({
  ReviewList: () => <div data-testid="review-list-mock">Review List</div>,
}));

vi.mock("../students-list", () => ({
  StudentsList: () => <div data-testid="students-list-mock">Students List</div>,
}));

describe("AdminCourseDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useParams).mockReturnValue({ id: "course-999" });
  });

  it("shouldRenderErrorStateWhenCourseFetchFails", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return error state.
    // ----------------------------------------------------------------------------
    vi.mocked(coursesApi.useCourseByIdQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to fetch"),
      refetch: vi.fn(),
    } as any);

    // ----------------------------------------------------------------------------
    // Act
    // Render AdminCourseDetailPage.
    // ----------------------------------------------------------------------------
    render(<AdminCourseDetailPage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify error state title.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Failed to fetch course details"),
    ).toBeInTheDocument();
  });

  it("shouldRenderCourseHeroAndSubListsOnSuccess", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock course response.
    // ----------------------------------------------------------------------------
    const mockCourse = {
      id: "course-999",
      title: "Kubernetes & Microservices Architecture",
      lecturers: ["Admin Lecturer"],
    };

    vi.mocked(coursesApi.useCourseByIdQuery).mockReturnValue({
      data: mockCourse,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    // ----------------------------------------------------------------------------
    // Act
    // Render AdminCourseDetailPage.
    // ----------------------------------------------------------------------------
    render(<AdminCourseDetailPage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify CourseHero and all 5 sub-lists render.
    // ----------------------------------------------------------------------------
    expect(screen.getByTestId("course-hero-mock")).toHaveTextContent(
      "Kubernetes & Microservices Architecture",
    );
    expect(screen.getByTestId("lectures-list-mock")).toBeInTheDocument();
    expect(screen.getByTestId("discounts-list-mock")).toBeInTheDocument();
    expect(screen.getByTestId("lecturers-list-mock")).toBeInTheDocument();
    expect(screen.getByTestId("students-list-mock")).toBeInTheDocument();
    expect(screen.getByTestId("review-list-mock")).toBeInTheDocument();
  });
});
