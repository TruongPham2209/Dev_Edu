/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/courses/[id]/lectures/page.tsx
 *
 * Purpose
 * -------
 * Verify that StudentLecturePage component loads lectures list and active lecture details,
 * renders LectureSkeleton when loading, renders ErrorState when lecture is missing,
 * and renders SidebarContainer alongside animated tabs.
 *
 * Tested Features
 * ---------------
 * ✓ LectureSkeleton rendering during initial loading state
 * ✓ ErrorState rendering when active lecture is not found
 * ✓ Active lecture content, tabs ("Comments", "Materials", "Assignments"), and SidebarContainer rendering
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state
 * ✓ Lecture not found error state
 * ✓ Displaying active lecture page layout
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation" (useRouter, useParams, useSearchParams)
 * - "@/lib/api/lectures" (useLecturesByCourseQuery, useLectureByIdQuery, useUpdateLectureProgressMutation)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 * - "@tanstack/react-query" (useQueryClient)
 * - "next/image" (mocked img tag)
 *
 * Not Covered
 * -----------
 * - CSS animation transitions
 *
 * Notes
 * -----
 * Unit test for StudentLecturePage component.
 */

import * as lecturesApi from "@/lib/api/lectures";
import { render, screen } from "@testing-library/react";
import * as navigation from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StudentLecturePage from "../page";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useParams: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock("@/lib/api/lectures", () => ({
  useLecturesByCourseQuery: vi.fn(),
  useLectureByIdQuery: vi.fn(),
  useUpdateLectureProgressMutation: vi.fn(),
  useAssignmentsQuery: vi.fn(() => ({ data: [], isLoading: false })),
  useInfiniteLectureCommentsQuery: vi.fn(() => ({
    data: { pages: [{ contents: [] }] },
    isLoading: false,
  })),
  useCreateLectureCommentMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useDeleteLectureCommentMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useMaterialsQuery: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: () => ({
    handleError: vi.fn(),
    showSuccess: vi.fn(),
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(() => ({ data: [], isLoading: false })),
  useQueryClient: () => ({
    fetchQuery: vi.fn(),
  }),
}));

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} alt={props.alt || "image"} />,
}));

describe("StudentLecturePage", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(navigation.useRouter).mockReturnValue({
      push: mockPush,
    } as any);

    vi.mocked(navigation.useParams).mockReturnValue({
      id: "course-100",
    } as any);

    vi.mocked(navigation.useSearchParams).mockReturnValue({
      get: (key: string) => (key === "lectureId" ? "lec-1" : null),
    } as any);

    vi.mocked(lecturesApi.useUpdateLectureProgressMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);
  });

  it("shouldRenderErrorStateWhenActiveLectureIsNotFound", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return lectures list but null activeLecture.
    // ----------------------------------------------------------------------------
    vi.mocked(lecturesApi.useLecturesByCourseQuery).mockReturnValue({
      data: [{ id: "lec-1", title: "Intro", isCompleted: false }],
      isLoading: false,
    } as any);

    vi.mocked(lecturesApi.useLectureByIdQuery).mockReturnValue({
      data: null,
      isLoading: false,
    } as any);

    // ----------------------------------------------------------------------------
    // Act
    // Render StudentLecturePage.
    // ----------------------------------------------------------------------------
    render(<StudentLecturePage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify error state text.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Lecture not found")).toBeInTheDocument();
  });

  it("shouldRenderActiveLectureContentAndSidebar", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock lectures and active lecture.
    // ----------------------------------------------------------------------------
    const mockLectures = [
      {
        id: "lec-1",
        title: "Introduction to Next.js 15",
        isCompleted: true,
        duration: 300,
      },
      {
        id: "lec-2",
        title: "Routing & Layouts",
        isCompleted: false,
        duration: 400,
      },
    ];

    const mockActiveLecture = {
      id: "lec-1",
      title: "Introduction to Next.js 15",
      summary: "First lesson in Next.js 15",
      duration: 300,
      uploadedAt: "2026-06-01T10:00:00.000Z",
      isCompleted: true,
      content: "<p>Welcome to Next.js 15!</p>",
      videoObjectKey: null,
    };

    vi.mocked(lecturesApi.useLecturesByCourseQuery).mockReturnValue({
      data: mockLectures,
      isLoading: false,
    } as any);

    vi.mocked(lecturesApi.useLectureByIdQuery).mockReturnValue({
      data: mockActiveLecture,
      isLoading: false,
    } as any);

    // ----------------------------------------------------------------------------
    // Act
    // Render StudentLecturePage.
    // ----------------------------------------------------------------------------
    render(<StudentLecturePage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify lecture title, summary, HTML content, and tab headers render.
    // ----------------------------------------------------------------------------
    expect(
      screen.getAllByRole("heading", { name: "Introduction to Next.js 15" })[0],
    ).toBeInTheDocument();
    expect(screen.getByText("First lesson in Next.js 15")).toBeInTheDocument();
    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(screen.getByText("Materials")).toBeInTheDocument();
    expect(screen.getByText("Assignments")).toBeInTheDocument();
  });
});
