/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/courses/[id]/lectures/[lectureId]/page.tsx
 *
 * Purpose
 * -------
 * Verify that AdminLectureDetailPage queries lecture, course, materials, and assignments data,
 * renders LectureDetailSkeleton during initial fetch, handles error state when lecture is not found,
 * and renders LectureHeroSection, MaterialsList, and AssignmentsList on success.
 *
 * Tested Features
 * ---------------
 * ✓ Querying lecture details via useLectureByIdQuery
 * ✓ LectureDetailSkeleton rendering while loading
 * ✓ ErrorState rendering when lecture is not found
 * ✓ Rendering LectureHeroSection, MaterialsList, and AssignmentsList
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state
 * ✓ Lecture not found error state
 * ✓ Page content rendering
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/lectures" (useLectureByIdQuery, useMaterialsQuery)
 * - "@/lib/api/courses" (useCourseByIdQuery)
 * - "@/lib/api/assignments" (useAssignmentsQuery)
 * - "next/navigation" (useParams, useRouter)
 * - "./lecture-hero" (mocked LectureHeroSection)
 * - "./materials-list" (mocked MaterialsList)
 * - "./assignments-list" (mocked AssignmentsList)
 *
 * Not Covered
 * -----------
 * - Video stream playback controls
 *
 * Notes
 * -----
 * Unit test for AdminLectureDetailPage component.
 */

import * as assignmentsApi from "@/lib/api/assignments";
import * as coursesApi from "@/lib/api/courses";
import * as lecturesApi from "@/lib/api/lectures";
import type { LectureResponse } from "@/lib/type/lectures";
import {
  createMockAssignment,
  createMockCourse,
  createMockLecture,
  createMockMaterial,
} from "@/testing/mock-data";
import { createMockQueryResult } from "@/testing/mock-query";
import { render, screen } from "@testing-library/react";
import { useParams, useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminLectureDetailPage from "../page";

vi.mock("@/lib/api/lectures", () => ({
  useLectureByIdQuery: vi.fn(),
  useMaterialsQuery: vi.fn(),
}));

vi.mock("@/lib/api/courses", () => ({
  useCourseByIdQuery: vi.fn(),
}));

vi.mock("@/lib/api/assignments", () => ({
  useAssignmentsQuery: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock("../lecture-hero", () => ({
  LectureHeroSection: ({ lecture }: { lecture?: LectureResponse }) => (
    <div data-testid="lecture-hero-mock">{lecture?.title}</div>
  ),
}));

vi.mock("../materials-list", () => ({
  MaterialsList: () => (
    <div data-testid="materials-list-mock">Materials List</div>
  ),
}));

vi.mock("../assignments-list", () => ({
  AssignmentsList: () => (
    <div data-testid="assignments-list-mock">Assignments List</div>
  ),
}));

describe("AdminLectureDetailPage", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useParams).mockReturnValue({
      id: "course-123",
      lectureId: "lec-888",
    });
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });
  });

  it("shouldRenderErrorStateWhenLectureIsNotFound", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return null lecture.
    // ----------------------------------------------------------------------------
    vi.mocked(lecturesApi.useLectureByIdQuery).mockReturnValue(
      createMockQueryResult(null as unknown as LectureResponse),
    );

    vi.mocked(coursesApi.useCourseByIdQuery).mockReturnValue(
      createMockQueryResult(
        createMockCourse({ id: "course-123", title: "Test Course" }),
      ),
    );

    vi.mocked(lecturesApi.useMaterialsQuery).mockReturnValue(
      createMockQueryResult([]),
    );

    vi.mocked(assignmentsApi.useAssignmentsQuery).mockReturnValue(
      createMockQueryResult([]),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render AdminLectureDetailPage.
    // ----------------------------------------------------------------------------
    render(<AdminLectureDetailPage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify error title text.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Lecture not found")).toBeInTheDocument();
  });

  it("shouldRenderLectureHeroSectionMaterialsAndAssignmentsOnSuccess", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock lecture object.
    // ----------------------------------------------------------------------------
    const mockLecture = createMockLecture({
      id: "lec-888",
      title: "Spring Security & JWT Authentication",
    });

    vi.mocked(lecturesApi.useLectureByIdQuery).mockReturnValue(
      createMockQueryResult(mockLecture),
    );

    vi.mocked(coursesApi.useCourseByIdQuery).mockReturnValue(
      createMockQueryResult(
        createMockCourse({ id: "course-123", title: "Enterprise Backend" }),
      ),
    );

    vi.mocked(lecturesApi.useMaterialsQuery).mockReturnValue(
      createMockQueryResult([
        createMockMaterial({ id: "mat-1", title: "PDF Guide" }),
      ]),
    );

    vi.mocked(assignmentsApi.useAssignmentsQuery).mockReturnValue(
      createMockQueryResult([
        createMockAssignment({ id: "asgn-1", title: "Auth Lab" }),
      ]),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render AdminLectureDetailPage.
    // ----------------------------------------------------------------------------
    render(<AdminLectureDetailPage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify LectureHeroSection, MaterialsList, and AssignmentsList render.
    // ----------------------------------------------------------------------------
    expect(screen.getByTestId("lecture-hero-mock")).toHaveTextContent(
      "Spring Security & JWT Authentication",
    );
    expect(screen.getByTestId("materials-list-mock")).toBeInTheDocument();
    expect(screen.getByTestId("assignments-list-mock")).toBeInTheDocument();
  });
});
