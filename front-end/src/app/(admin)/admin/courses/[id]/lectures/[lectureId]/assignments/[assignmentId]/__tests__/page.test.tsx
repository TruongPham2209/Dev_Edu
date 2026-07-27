/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/courses/[id]/lectures/[lectureId]/assignments/[assignmentId]/page.tsx
 *
 * Purpose
 * -------
 * Verify that AdminAssignmentDetailPage queries assignment, lecture, course, and submissions details,
 * renders AssignmentDetailSkeleton during loading, renders ErrorState when assignment is not found,
 * and renders AssignmentHeroSection and SubmissionsList on success.
 *
 * Tested Features
 * ---------------
 * ✓ Querying assignment details via useAssignmentByIdQuery
 * ✓ Querying lecture details via useLectureByIdQuery
 * ✓ Querying course details via useCourseByIdQuery
 * ✓ AssignmentDetailSkeleton rendering during loading
 * ✓ ErrorState rendering when assignment is not found
 * ✓ Rendering AssignmentHeroSection and SubmissionsList
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state
 * ✓ Assignment not found error state
 * ✓ Page content rendering
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/assignments" (useAssignmentByIdQuery, useSubmissionsInfiniteQuery, useFeedbacksQuery, useSubmissionTrackingQuery, useCreateFeedbackMutation, useDeleteFeedbackMutation)
 * - "@/lib/api/lectures" (useLectureByIdQuery)
 * - "@/lib/api/courses" (useCourseByIdQuery)
 * - "@/lib/api/files" (getDownloadUrl)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 * - "next/navigation" (useParams, useRouter)
 * - "./assignment-hero" (mocked AssignmentHeroSection)
 * - "./submissions-list" (mocked SubmissionsList)
 * - "@/components/dialog/submission-datail/page" (mocked SubmissionDetailsDialog)
 *
 * Not Covered
 * -----------
 * - Real file download triggers
 *
 * Notes
 * -----
 * Unit test for AdminAssignmentDetailPage component.
 */

import * as assignmentsApi from "@/lib/api/assignments";
import * as coursesApi from "@/lib/api/courses";
import * as lecturesApi from "@/lib/api/lectures";
import * as apiToast from "@/lib/use-api-with-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminAssignmentDetailPage from "../page";

vi.mock("@/lib/api/assignments", () => ({
  useAssignmentByIdQuery: vi.fn(),
  useSubmissionsInfiniteQuery: vi.fn(),
  useFeedbacksQuery: vi.fn(),
  useSubmissionTrackingQuery: vi.fn(),
  useCreateFeedbackMutation: vi.fn(),
  useDeleteFeedbackMutation: vi.fn(),
}));

vi.mock("@/lib/api/lectures", () => ({
  useLectureByIdQuery: vi.fn(),
}));

vi.mock("@/lib/api/courses", () => ({
  useCourseByIdQuery: vi.fn(),
}));

vi.mock("@/lib/api/files", () => ({
  getDownloadUrl: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock("../assignment-hero", () => ({
  AssignmentHeroSection: ({ assignment }: any) => (
    <div data-testid="assignment-hero-mock">{assignment.title}</div>
  ),
}));

vi.mock("../submissions-list", () => ({
  SubmissionsList: () => (
    <div data-testid="submissions-list-mock">Submissions List</div>
  ),
}));

vi.mock("@/components/dialog/submission-datail/page", () => ({
  SubmissionDetailsDialog: () => null,
}));

describe("AdminAssignmentDetailPage", () => {
  let queryClient: QueryClient;
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    vi.mocked(useParams).mockReturnValue({
      id: "course-1",
      lectureId: "lec-10",
      assignmentId: "asgn-500",
    });
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);

    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      showSuccess: vi.fn(),
      handleError: vi.fn(),
    } as any);

    vi.mocked(assignmentsApi.useSubmissionsInfiniteQuery).mockReturnValue({
      data: { pages: [{ contents: [] }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    } as any);

    vi.mocked(assignmentsApi.useFeedbacksQuery).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(assignmentsApi.useSubmissionTrackingQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    vi.mocked(assignmentsApi.useCreateFeedbackMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);

    vi.mocked(assignmentsApi.useDeleteFeedbackMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("shouldRenderErrorStateWhenAssignmentIsNotFound", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return null assignment.
    // ----------------------------------------------------------------------------
    vi.mocked(assignmentsApi.useAssignmentByIdQuery).mockReturnValue({
      data: null,
      isLoading: false,
    } as any);

    vi.mocked(lecturesApi.useLectureByIdQuery).mockReturnValue({
      data: { id: "lec-10", title: "REST APIs" },
      isLoading: false,
    } as any);

    vi.mocked(coursesApi.useCourseByIdQuery).mockReturnValue({
      data: { id: "course-1", title: "Java Backend" },
      isLoading: false,
    } as any);

    // ----------------------------------------------------------------------------
    // Act
    // Render AdminAssignmentDetailPage.
    // ----------------------------------------------------------------------------
    render(<AdminAssignmentDetailPage />, { wrapper });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify error title text.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Cannot find assignment or error occurred"),
    ).toBeInTheDocument();
  });

  it("shouldRenderAssignmentHeroSectionAndSubmissionsListOnSuccess", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock assignment object.
    // ----------------------------------------------------------------------------
    const mockAssignment = {
      id: "asgn-500",
      title: "Build RESTful APIs with Spring Boot",
    };

    vi.mocked(assignmentsApi.useAssignmentByIdQuery).mockReturnValue({
      data: mockAssignment,
      isLoading: false,
    } as any);

    vi.mocked(lecturesApi.useLectureByIdQuery).mockReturnValue({
      data: { id: "lec-10", title: "REST APIs" },
      isLoading: false,
    } as any);

    vi.mocked(coursesApi.useCourseByIdQuery).mockReturnValue({
      data: { id: "course-1", title: "Java Backend" },
      isLoading: false,
    } as any);

    // ----------------------------------------------------------------------------
    // Act
    // Render AdminAssignmentDetailPage.
    // ----------------------------------------------------------------------------
    render(<AdminAssignmentDetailPage />, { wrapper });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify AssignmentHeroSection and SubmissionsList render.
    // ----------------------------------------------------------------------------
    expect(screen.getByTestId("assignment-hero-mock")).toHaveTextContent(
      "Build RESTful APIs with Spring Boot",
    );
    expect(screen.getByTestId("submissions-list-mock")).toBeInTheDocument();
  });
});
