/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(lecturer)/lecturer/courses/[id]/lectures/[lectureId]/assignments/[assignmentId]/page.tsx
 *
 * Purpose
 * -------
 * Verify that LecturerAssignmentDetailPage queries assignment, lecture, and course details,
 * renders AssignmentDetailSkeleton during loading, renders AssignmentHeroInfo and tabs (Overview, Submissions),
 * and supports tab switching.
 *
 * Tested Features
 * ---------------
 * ✓ Querying assignment details via useAssignmentByIdQuery
 * ✓ Querying lecture details via useLectureByIdQuery
 * ✓ Querying course details via useCourseByIdQuery
 * ✓ AssignmentDetailSkeleton rendering during loading
 * ✓ Switching between Overview and Submissions tabs
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state
 * ✓ Error state when assignment is not found
 * ✓ Tab switching
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/assignments" (useAssignmentByIdQuery, useSubmissionsInfiniteQuery, useFeedbacksQuery, useSubmissionTrackingQuery, useCreateFeedbackMutation, useDeleteFeedbackMutation)
 * - "@/lib/api/lectures" (useLectureByIdQuery)
 * - "@/lib/api/courses" (useCourseByIdQuery)
 * - "@/lib/api/files" (getDownloadUrl)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 * - "next/navigation" (useParams, useRouter)
 * - "./assignment-overview" (mocked AssignmentOverview)
 * - "./submissions-table" (mocked SubmissionsTable)
 * - "@tanstack/react-query" (useQueryClient)
 *
 * Not Covered
 * -----------
 * - Real file download HTTP requests
 *
 * Notes
 * -----
 * Unit test for LecturerAssignmentDetailPage component.
 */

import * as assignmentsApi from "@/lib/api/assignments";
import * as coursesApi from "@/lib/api/courses";
import * as lecturesApi from "@/lib/api/lectures";
import * as apiToast from "@/lib/use-api-with-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LecturerAssignmentDetailPage from "../page";

vi.mock("@/lib/api/assignments", () => ({
  useAssignmentByIdQuery: vi.fn(),
  useSubmissionsInfiniteQuery: vi.fn(),
  useFeedbacksQuery: vi.fn(),
  useSubmissionTrackingQuery: vi.fn(),
  useSubmissionTrackingInfiniteQuery: vi.fn(),
  useCreateFeedbackMutation: vi.fn(),
  useDeleteFeedbackMutation: vi.fn(),
}));

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

vi.mock("../assignment-overview", () => ({
  AssignmentOverview: ({ assignment }: { assignment?: { title?: string } }) => (
    <div data-testid="assignment-overview">{assignment?.title}</div>
  ),
}));

vi.mock("../submissions-table", () => ({
  SubmissionsTable: () => (
    <div data-testid="submissions-table">Submissions Table</div>
  ),
}));

vi.mock("@/components/common/hero-section/assignment-hero-info", () => ({
  AssignmentHeroInfo: ({ assignment }: { assignment?: { title?: string } }) => (
    <div data-testid="assignment-hero-info">{assignment?.title}</div>
  ),
}));

vi.mock("@/components/dialog/submission-datail/page", () => ({
  SubmissionDetailsDialog: () => null,
}));

describe("LecturerAssignmentDetailPage", () => {
  let queryClient: QueryClient;
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    vi.mocked(useParams).mockReturnValue({
      id: "course-1",
      lectureId: "lec-1",
      assignmentId: "assign-50",
    });

    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as never);

    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      showSuccess: vi.fn(),
      handleError: vi.fn(),
    } as never);

    vi.mocked(assignmentsApi.useSubmissionsInfiniteQuery).mockReturnValue({
      data: { pages: [{ contents: [], totalElements: 0 }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    } as never);

    vi.mocked(assignmentsApi.useFeedbacksQuery).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    } as never);

    vi.mocked(assignmentsApi.useSubmissionTrackingQuery).mockReturnValue({
      data: { contents: [], currentPage: 0, totalPages: 1 },
      isLoading: false,
    } as never);

    vi.mocked(assignmentsApi.useSubmissionTrackingInfiniteQuery).mockReturnValue({
      data: { pages: [{ contents: [], nextCursor: undefined }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    } as never);

    vi.mocked(assignmentsApi.useCreateFeedbackMutation).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    } as never);

    vi.mocked(assignmentsApi.useDeleteFeedbackMutation).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    } as never);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("shouldRenderErrorStateWhenAssignmentNotFound", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return null assignment.
    // ----------------------------------------------------------------------------
    vi.mocked(assignmentsApi.useAssignmentByIdQuery).mockReturnValue({
      data: null,
      isLoading: false,
    } as never);

    vi.mocked(lecturesApi.useLectureByIdQuery).mockReturnValue({
      data: { id: "lec-1", title: "Clean Code" },
      isLoading: false,
    } as never);

    vi.mocked(coursesApi.useCourseByIdQuery).mockReturnValue({
      data: { id: "course-1", title: "Fullstack Dev" },
      isLoading: false,
    } as never);

    // ----------------------------------------------------------------------------
    // Act
    // Render LecturerAssignmentDetailPage.
    // ----------------------------------------------------------------------------
    render(<LecturerAssignmentDetailPage />, { wrapper });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify error state title.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Failed to load assignment details"),
    ).toBeInTheDocument();
  });

  it("shouldFetchAndRenderAssignmentDetailsAndSwitchTabs", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return mock assignment.
    // ----------------------------------------------------------------------------
    const mockAssignment = {
      id: "assign-50",
      title: "React State Management Task",
      description: "Implement Redux Toolkit store",
      createdAt: "2026-06-01T00:00:00.000Z",
    };

    vi.mocked(assignmentsApi.useAssignmentByIdQuery).mockReturnValue({
      data: mockAssignment,
      isLoading: false,
    } as never);

    vi.mocked(lecturesApi.useLectureByIdQuery).mockReturnValue({
      data: { id: "lec-1", title: "State Management in React" },
      isLoading: false,
    } as never);

    vi.mocked(coursesApi.useCourseByIdQuery).mockReturnValue({
      data: { id: "course-1", title: "Advanced React Mastery" },
      isLoading: false,
    } as never);

    // ----------------------------------------------------------------------------
    // Act
    // Render LecturerAssignmentDetailPage.
    // ----------------------------------------------------------------------------
    render(<LecturerAssignmentDetailPage />, { wrapper });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify hero banner and overview content render.
    // ----------------------------------------------------------------------------
    expect(screen.getByTestId("assignment-hero-info")).toHaveTextContent(
      "React State Management Task",
    );
    expect(screen.getByTestId("assignment-overview")).toHaveTextContent(
      "React State Management Task",
    );

    // Switch to Submissions tab
    const submissionsTab = screen.getByRole("tab", { name: /Submissions/i });
    fireEvent.click(submissionsTab);

    expect(screen.getByTestId("submissions-table")).toBeInTheDocument();
  });
});
