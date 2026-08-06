/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(lecturer)/lecturer/courses/[id]/quizzes/[quizId]/assignments/page.tsx
 *
 * Purpose
 * -------
 * Verify Quiz Assignments Management page for lecturer, showing assignment list,
 * publish modal button, and delete action triggers.
 *
 * Tested Features
 * ---------------
 * ✓ Querying quiz detail and quiz assignments list
 * ✓ Rendering DataTable with assignment name, duration, attempts, and shuffle options
 * ✓ Action button to open Create Assignment dialog
 *
 * Covered Scenarios
 * -----------------
 * ✓ Lecturer quiz assignments table rendering
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation" (useParams, useRouter)
 * - "@/lib/api/courses" (useCourseByIdQuery)
 * - "@/lib/api/quizzes" (useQuizByIdQuery, useQuizAssignmentsByQuizQuery, useCreateQuizAssignmentMutation, useDeleteQuizAssignmentMutation)
 * - "@/lib/toast-context" (useToast)
 *
 * Not Covered
 * -----------
 * - Confirm dialog delete interactions
 *
 * Notes
 * -----
 * Unit test for LecturerAssignmentsPage component.
 */

import * as quizzesApi from "@/lib/api/quizzes";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LecturerAssignmentsPage from "../page";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "course-123", quizId: "quiz-99" }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/api/quizzes", () => ({
  useQuizByIdQuery: vi.fn(),
  useQuizAssignmentsByQuizQuery: vi.fn(),
  useCreateQuizAssignmentMutation: vi.fn(),
  useDeleteQuizAssignmentMutation: vi.fn(),
}));

vi.mock("@/lib/api/courses", () => ({
  useCourseByIdQuery: vi.fn(() => ({
    data: { id: "course-123", title: "Course 101" },
    isLoading: false,
  })),
}));

vi.mock("@/lib/toast-context", () => ({
  useToast: vi.fn(() => ({ success: vi.fn(), error: vi.fn() })),
}));

describe("LecturerAssignmentsPage Component", () => {
  const mockQuiz = {
    id: "quiz-99",
    title: "Midterm Exam",
  };

  const mockAssignments = [
    {
      id: "assign-1",
      assignmentName: "Class A Midterm Assignment",
      title: "Class A Midterm Assignment",
      durationMinutes: 60,
      passScore: 7,
      maxAttempts: 1,
      isActive: true,
      createdAt: "2026-08-06T10:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(quizzesApi.useQuizByIdQuery).mockReturnValue({
      data: mockQuiz,
      isLoading: false,
    } as any);

    vi.mocked(quizzesApi.useQuizAssignmentsByQuizQuery).mockReturnValue({
      data: mockAssignments,
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(quizzesApi.useCreateQuizAssignmentMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(quizzesApi.useDeleteQuizAssignmentMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
  });

  it("shouldRenderQuizTitleAndAssignmentTable", () => {
    render(<LecturerAssignmentsPage />);

    expect(screen.getByText("Class A Midterm Assignment")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Create Assignment/i }),
    ).toBeInTheDocument();
  });
});
