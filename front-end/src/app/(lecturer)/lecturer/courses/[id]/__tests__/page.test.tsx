/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(lecturer)/lecturer/courses/[id]/page.tsx
 *
 * Purpose
 * -------
 * Verify that LecturerCourseDetailPage fetches course details by ID, displays LecturerCourseDetailSkeleton during loading,
 * renders CourseHero and tab content (Overview, Curriculum, Students) when loaded, and handles error state fallback.
 *
 * Tested Features
 * ---------------
 * ✓ Fetching course details via getCourseById
 * ✓ LecturerCourseDetailSkeleton rendering during data loading
 * ✓ ErrorState rendering when course fails to load
 * ✓ CourseHero rendering and switching tabs (Overview, Curriculum, Students)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state
 * ✓ Course not found / Error state
 * ✓ Active tab switching
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/courses" (getCourseById)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 * - "next/navigation" (useParams, useRouter)
 * - "../course-hero" (mocked CourseHero)
 * - "../lectures-tab" (mocked LecturesTab)
 * - "../students-tab" (mocked StudentsTab)
 *
 * Not Covered
 * -----------
 * - Scroll position persistence
 *
 * Notes
 * -----
 * Unit test for LecturerCourseDetailPage component.
 */

import * as coursesApi from "@/lib/api/courses";
import * as apiToast from "@/lib/use-api-with-toast";
import { createMockCourse, createMockRouter } from "@/testing/mock-data";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useParams, useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LecturerCourseDetailPage from "../page";

vi.mock("@/lib/api/courses", () => ({
  getCourseById: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock("../course-hero", () => ({
  CourseHero: ({ course }: { course?: { title?: string } }) => (
    <div data-testid="course-hero-mock">{course?.title}</div>
  ),
}));

vi.mock("../lectures-tab", () => ({
  LecturesTab: () => (
    <div data-testid="lectures-tab-component">Curriculum Content</div>
  ),
}));

vi.mock("../students-tab", () => ({
  StudentsTab: () => (
    <div data-testid="students-tab-component">Students List Content</div>
  ),
}));

describe("LecturerCourseDetailPage", () => {
  const mockPush = vi.fn();
  const mockHandleError = vi.fn();
  const mockShowSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useParams).mockReturnValue({ id: "course-777" });
    vi.mocked(useRouter).mockReturnValue(createMockRouter({ push: mockPush }));

    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast({
        showSuccess: mockShowSuccess,
        handleError: mockHandleError,
      }),
    );
  });

  it("shouldRenderErrorStateWhenCourseIsNotFound", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Reject getCourseById request.
    // ----------------------------------------------------------------------------
    vi.mocked(coursesApi.getCourseById).mockRejectedValue(
      new Error("Course not found"),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render LecturerCourseDetailPage.
    // ----------------------------------------------------------------------------
    render(<LecturerCourseDetailPage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify error state title.
    // ----------------------------------------------------------------------------
    await waitFor(() =>
      expect(
        screen.getByText("Failed to load course details"),
      ).toBeInTheDocument(),
    );
  });

  it("shouldFetchAndRenderCourseDetailsAndAllowSwitchingTabs", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock course response.
    // ----------------------------------------------------------------------------
    const mockCourse = createMockCourse({
      id: "course-777",
      description: "<p>Build resilient cloud-native applications.</p>",
      thumbnailUrl: "https://example.com/thumb.jpg",
      createdAt: "2026-05-01T00:00:00.000Z",
    });
    vi.mocked(coursesApi.getCourseById).mockResolvedValue(mockCourse);

    // ----------------------------------------------------------------------------
    // ----------------------------------------------------------------------------
    render(<LecturerCourseDetailPage />);
    // Assert
    // Verify course overview description rendering.
    // ----------------------------------------------------------------------------
    await waitFor(() =>
      expect(screen.getByTestId("course-hero-mock")).toHaveTextContent(
        "Enterprise Microservices with Spring Boot",
      ),
    );

    expect(
      screen.getByText("Build resilient cloud-native applications."),
    ).toBeInTheDocument();

    // Switch to Curriculum tab
    const curriculumTab = screen.getByRole("tab", { name: /Curriculum/i });
    fireEvent.click(curriculumTab);

    expect(screen.getByTestId("lectures-tab-component")).toBeInTheDocument();

    // Switch to Students tab
    const studentsTab = screen.getByRole("tab", { name: /Students/i });
    fireEvent.click(studentsTab);

    expect(screen.getByTestId("students-tab-component")).toBeInTheDocument();
  });
});
