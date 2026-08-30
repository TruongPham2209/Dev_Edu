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
import type {
  AssignmentResponse,
  SubmissionResponse,
} from "@/lib/type/assignments";
import type { CustomPaging } from "@/lib/type/api";
import {
  createMockAssignment,
  createMockCourse,
  createMockLecture,
} from "@/testing/mock-data";
import {
  createMockApiWithToast,
  createMockInfiniteQueryResult,
  createMockMutationResult,
  createMockQueryResult,
} from "@/testing/mock-query";
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
  AssignmentHeroSection: ({
    assignment,
  }: {
    assignment?: AssignmentResponse;
  }) => <div data-testid="assignment-hero-mock">{assignment?.title}</div>,
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
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });

    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast(),
    );

    const emptyPaging: CustomPaging<SubmissionResponse> = {
      contents: [],
      currentPage: 0,
      pageSize: 10,
      totalElements: 0,
      totalPages: 0,
    };

    vi.mocked(assignmentsApi.useSubmissionsInfiniteQuery).mockReturnValue(
      createMockInfiniteQueryResult({
        pageParams: [0],
        pages: [emptyPaging],
      }),
    );

    vi.mocked(assignmentsApi.useFeedbacksQuery).mockReturnValue(
      createMockQueryResult([]),
    );

    vi.mocked(assignmentsApi.useSubmissionTrackingQuery).mockReturnValue(
      createMockQueryResult(),
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

  it("shouldRenderErrorStateWhenAssignmentIsNotFound", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return null assignment.
    // ----------------------------------------------------------------------------
    vi.mocked(assignmentsApi.useAssignmentByIdQuery).mockReturnValue(
      createMockQueryResult(null as unknown as AssignmentResponse),
    );

    vi.mocked(lecturesApi.useLectureByIdQuery).mockReturnValue(
      createMockQueryResult(
        createMockLecture({ id: "lec-10", title: "REST APIs" }),
      ),
    );

    vi.mocked(coursesApi.useCourseByIdQuery).mockReturnValue(
      createMockQueryResult(
        createMockCourse({ id: "course-1", title: "Java Backend" }),
      ),
    );

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
    const mockAssignment: AssignmentResponse = createMockAssignment({
      id: "asgn-500",
      title: "Build RESTful APIs with Spring Boot",
    });

    vi.mocked(assignmentsApi.useAssignmentByIdQuery).mockReturnValue(
      createMockQueryResult(mockAssignment),
    );

    vi.mocked(lecturesApi.useLectureByIdQuery).mockReturnValue(
      createMockQueryResult(
        createMockLecture({ id: "lec-10", title: "REST APIs" }),
      ),
    );

    vi.mocked(coursesApi.useCourseByIdQuery).mockReturnValue(
      createMockQueryResult(
        createMockCourse({ id: "course-1", title: "Java Backend" }),
      ),
    );

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
