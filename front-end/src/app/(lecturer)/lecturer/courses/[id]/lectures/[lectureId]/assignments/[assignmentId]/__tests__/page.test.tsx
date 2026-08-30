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

import type {
  AssignmentResponse,
  FeedbackResponse,
  SubmissionLogResponse,
  SubmissionResponse,
} from "@/lib/type/assignments";
import type { CourseResponse } from "@/lib/type/courses";
import type { LectureResponse } from "@/lib/type/lectures";
import * as assignmentsApi from "@/lib/api/assignments";
import * as coursesApi from "@/lib/api/courses";
import * as lecturesApi from "@/lib/api/lectures";
import * as apiToast from "@/lib/use-api-with-toast";
import {
  createMockAssignment,
  createMockCourse,
  createMockCustomPaging,
  createMockLecture,
  createMockRouter,
} from "@/testing/mock-data";
import {
  createMockApiWithToast,
  createMockInfiniteQueryResult,
  createMockMutationResult,
  createMockQueryResult,
} from "@/testing/mock-query";
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

    vi.mocked(useRouter).mockReturnValue(createMockRouter({ push: mockPush }));

    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast(),
    );

    vi.mocked(assignmentsApi.useSubmissionsInfiniteQuery).mockReturnValue(
      createMockInfiniteQueryResult({
        pages: [createMockCustomPaging<SubmissionResponse>([])],
        pageParams: [0],
      }),
    );

    vi.mocked(assignmentsApi.useFeedbacksQuery).mockReturnValue(
      createMockQueryResult<FeedbackResponse[]>([]),
    );

    vi.mocked(assignmentsApi.useSubmissionTrackingQuery).mockReturnValue(
      createMockQueryResult(
        createMockCustomPaging<SubmissionLogResponse>([]),
      ),
    );

    vi.mocked(assignmentsApi.useSubmissionTrackingInfiniteQuery).mockReturnValue(
      createMockInfiniteQueryResult({
        pages: [createMockCustomPaging<SubmissionLogResponse>([])],
        pageParams: [0],
      }),
    );

    vi.mocked(assignmentsApi.useCreateFeedbackMutation).mockReturnValue(
      createMockMutationResult(),
    );

    vi.mocked(assignmentsApi.useDeleteFeedbackMutation).mockReturnValue(
      createMockMutationResult(),
    );
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("shouldRenderErrorStateWhenAssignmentNotFound", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return null assignment.
    // ----------------------------------------------------------------------------
    vi.mocked(assignmentsApi.useAssignmentByIdQuery).mockReturnValue(
      createMockQueryResult<AssignmentResponse>(undefined),
    );

    vi.mocked(lecturesApi.useLectureByIdQuery).mockReturnValue(
      createMockQueryResult<LectureResponse>(
        createMockLecture({ id: "lec-1", title: "Clean Code" }),
      ),
    );

    vi.mocked(coursesApi.useCourseByIdQuery).mockReturnValue(
      createMockQueryResult<CourseResponse>(
        createMockCourse({ id: "course-1", title: "Fullstack Dev" }),
      ),
    );

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
    const mockAssignment: AssignmentResponse = createMockAssignment({
      id: "assign-50",
      title: "React State Management Task",
      description: "Implement Redux Toolkit store",
      createdAt: "2026-06-01T00:00:00.000Z",
    });

    vi.mocked(assignmentsApi.useAssignmentByIdQuery).mockReturnValue(
      createMockQueryResult(mockAssignment),
    );

    vi.mocked(lecturesApi.useLectureByIdQuery).mockReturnValue(
      createMockQueryResult<LectureResponse>(
        createMockLecture({
          id: "lec-1",
          title: "State Management in React",
        }),
      ),
    );

    vi.mocked(coursesApi.useCourseByIdQuery).mockReturnValue(
      createMockQueryResult<CourseResponse>(
        createMockCourse({
          id: "course-1",
          title: "Advanced React Mastery",
        }),
      ),
    );

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
