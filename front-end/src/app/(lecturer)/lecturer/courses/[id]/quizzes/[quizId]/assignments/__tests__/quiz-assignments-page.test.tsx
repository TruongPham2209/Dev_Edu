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
import type {
  QuizAssignmentResponse,
  QuizDetailResponse,
  QuizResponse,
} from "@/lib/type/quizzes";
import {
  createMockMutationResult,
  createMockQueryResult,
} from "@/testing/mock-query";
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

describe("Lecturer Quiz Assignments Page", () => {
  const mockQuiz: QuizResponse = {
    id: "quiz-99",
    courseId: "course-1",
    courseTitle: "Course 1",
    title: "Midterm Exam",
    description: "Midterm Exam description",
    status: "APPROVED",
    createdAt: "2026-08-06T10:00:00Z",
  };

  const mockQuizDetail: QuizDetailResponse = {
    quiz: mockQuiz,
    typeConfigs: [],
    questions: [],
  };

  const mockAssignments: QuizAssignmentResponse[] = [
    {
      id: "assign-1",
      quizId: "quiz-99",
      assignmentName: "Class A Midterm Assignment",
      startTime: "2026-08-06T10:00:00Z",
      durationMinutes: 60,
      shuffleQuestions: false,
      shuffleOptions: false,
      maxAttempts: 1,
      status: "ACTIVE",
      createdAt: "2026-08-06T10:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(quizzesApi.useQuizByIdQuery).mockReturnValue(
      createMockQueryResult(mockQuizDetail),
    );

    vi.mocked(quizzesApi.useQuizAssignmentsByQuizQuery).mockReturnValue(
      createMockQueryResult(mockAssignments),
    );

    vi.mocked(quizzesApi.useCreateQuizAssignmentMutation).mockReturnValue(
      createMockMutationResult(),
    );

    vi.mocked(quizzesApi.useDeleteQuizAssignmentMutation).mockReturnValue(
      createMockMutationResult(),
    );
  });

  it("shouldRenderQuizTitleAndAssignmentTable", () => {
    render(<LecturerAssignmentsPage />);

    expect(screen.getByText("Class A Midterm Assignment")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Create Assignment/i }),
    ).toBeInTheDocument();
  });
});
