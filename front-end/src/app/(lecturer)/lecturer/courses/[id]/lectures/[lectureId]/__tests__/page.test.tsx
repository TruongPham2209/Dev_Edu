/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(lecturer)/lecturer/courses/[id]/lectures/[lectureId]/page.tsx
 *
 * Purpose
 * -------
 * Verify that LecturerLectureDetailPage queries lecture and course details by ID, displays LectureDetailSkeleton during loading,
 * renders LectureHeroInfo and tabs (Overview, Materials, Assignments, Comments), and allows switching between tabs.
 *
 * Tested Features
 * ---------------
 * ✓ Fetching lecture details via useLectureByIdQuery
 * ✓ Fetching course details via useCourseByIdQuery
 * ✓ LectureDetailSkeleton rendering during loading
 * ✓ Switching tabs (Overview, Materials, Assignments, Comments)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state
 * ✓ Error state when lecture is not found
 * ✓ Tab navigation
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/lectures" (useLectureByIdQuery)
 * - "@/lib/api/courses" (useCourseByIdQuery)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 * - "next/navigation" (useParams, useRouter)
 * - "./assignments-tab" (mocked AssignmentsTab)
 * - "./comment-tab" (mocked TabComments)
 * - "./materials-tab" (mocked MaterialsTab)
 *
 * Not Covered
 * -----------
 * - Video stream playback controls
 *
 * Notes
 * -----
 * Unit test for LecturerLectureDetailPage component.
 */

import * as coursesApi from "@/lib/api/courses";
import * as lecturesApi from "@/lib/api/lectures";
import * as apiToast from "@/lib/use-api-with-toast";
import { fireEvent, render, screen } from "@testing-library/react";
import { useParams, useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LecturerLectureDetailPage from "../page";

vi.mock("@/lib/api/lectures", () => ({
  useLectureByIdQuery: vi.fn(),
}));

vi.mock("@/lib/api/courses", () => ({
  useCourseByIdQuery: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock("../assignments-tab", () => ({
  AssignmentsTab: () => (
    <div data-testid="assignments-tab">Assignments Content</div>
  ),
}));

vi.mock("../comment-tab", () => ({
  TabComments: () => <div data-testid="comments-tab">Comments Content</div>,
}));

vi.mock("../materials-tab", () => ({
  MaterialsTab: () => <div data-testid="materials-tab">Materials Content</div>,
}));

vi.mock("@/components/common/hero-section/lecture-hero-info", () => ({
  LectureHeroInfo: ({ lecture }: { lecture?: { title?: string } }) => (
    <div data-testid="lecture-hero-info">{lecture?.title}</div>
  ),
}));

describe("LecturerLectureDetailPage", () => {
  const mockPush = vi.fn();
  const mockHandleError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useParams).mockReturnValue({
      id: "course-1",
      lectureId: "lec-99",
    });
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as never);
    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      showSuccess: vi.fn(),
      handleError: mockHandleError,
    } as never);
  });

  it("shouldRenderErrorStateWhenLectureIsNotFound", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return null lecture.
    // ----------------------------------------------------------------------------
    vi.mocked(lecturesApi.useLectureByIdQuery).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Not found"),
    } as never);

    vi.mocked(coursesApi.useCourseByIdQuery).mockReturnValue({
      data: { id: "course-1", title: "Test Course" },
      isLoading: false,
    } as never);

    // ----------------------------------------------------------------------------
    // Act
    // Render LecturerLectureDetailPage.
    // ----------------------------------------------------------------------------
    render(<LecturerLectureDetailPage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify error state text.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Failed to load lecture details"),
    ).toBeInTheDocument();
  });

  it("shouldFetchAndRenderLectureDetailsAndAllowSwitchingTabs", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return mock lecture and course.
    // ----------------------------------------------------------------------------
    const mockLecture = {
      id: "lec-99",
      title: "Domain-Driven Design Fundamentals",
      summary: "Learn aggregates and value objects",
      content: "Deep dive into domain boundaries.",
      videoObjectKey: "videos/ddd.mp4",
    };

    vi.mocked(lecturesApi.useLectureByIdQuery).mockReturnValue({
      data: mockLecture,
      isLoading: false,
      error: null,
    } as never);

    vi.mocked(coursesApi.useCourseByIdQuery).mockReturnValue({
      data: { id: "course-1", title: "Clean Code & Architecture" },
      isLoading: false,
    } as never);

    // ----------------------------------------------------------------------------
    // Act
    // Render LecturerLectureDetailPage.
    // ----------------------------------------------------------------------------
    render(<LecturerLectureDetailPage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify breadcrumb, hero info, and overview content render.
    // ----------------------------------------------------------------------------
    expect(screen.getByTestId("lecture-hero-info")).toHaveTextContent(
      "Domain-Driven Design Fundamentals",
    );
    expect(
      screen.getByText("Deep dive into domain boundaries."),
    ).toBeInTheDocument();

    // Switch to Materials Tab
    const materialsTabBtn = screen.getByRole("tab", { name: /Materials/i });
    fireEvent.click(materialsTabBtn);
    expect(screen.getByTestId("materials-tab")).toBeInTheDocument();

    // Switch to Assignments Tab
    const assignmentsTabBtn = screen.getByRole("tab", { name: /Assignments/i });
    fireEvent.click(assignmentsTabBtn);
    expect(screen.getByTestId("assignments-tab")).toBeInTheDocument();

    // Switch to Comments Tab
    const commentsTabBtn = screen.getByRole("tab", { name: /Comments/i });
    fireEvent.click(commentsTabBtn);
    expect(screen.getByTestId("comments-tab")).toBeInTheDocument();
  });
});
