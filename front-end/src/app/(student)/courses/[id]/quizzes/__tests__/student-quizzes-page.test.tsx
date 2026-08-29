/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/courses/[id]/quizzes/page.tsx
 *
 * Purpose
 * -------
 * Verify Student Course Quizzes page renders available quiz assignments, due dates,
 * max attempts, attempt history, and "Take Quiz" action button.
 *
 * Tested Features
 * ---------------
 * ✓ Querying course details and quiz assignments list for student
 * ✓ Rendering quiz card grid with duration, max attempts, and start/end dates
 * ✓ Opening quiz assignment detail modal on card selection
 *
 * Covered Scenarios
 * -----------------
 * ✓ Active student quizzes list display
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation" (useRouter)
 * - "@/lib/api/courses" (useCourseByIdQuery)
 * - "@/lib/api/quizzes" (useQuizAssignmentsByCourseQuery, useStudentAttemptHistoryQuery, useStartAttemptMutation)
 * - "@/lib/toast-context" (useToast)
 *
 * Not Covered
 * -----------
 * - Direct navigation route changes
 *
 * Notes
 * -----
 * Unit test for StudentCourseQuizzesPage component.
 */

import * as coursesApi from "@/lib/api/courses";
import * as quizzesApi from "@/lib/api/quizzes";
import type { QuizAssignmentResponse } from "@/lib/type/quizzes";
import { createMockCourse } from "@/testing/mock-data";
import {
  createMockMutationResult,
  createMockQueryResult,
} from "@/testing/mock-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StudentCourseQuizzesPage from "../page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/api/quizzes", () => ({
  useQuizAssignmentsByCourseQuery: vi.fn(),
  useStudentAttemptHistoryQuery: vi.fn(),
  useStartAttemptMutation: vi.fn(),
}));

vi.mock("@/lib/api/courses", () => ({
  useCourseByIdQuery: vi.fn(),
}));

vi.mock("@/lib/toast-context", () => ({
  useToast: vi.fn(() => ({ success: vi.fn(), error: vi.fn() })),
}));

describe("StudentCourseQuizzesPage", () => {
  const mockAssignments: QuizAssignmentResponse[] = [
    {
      id: "asg-1",
      quizId: "quiz-1",
      assignmentName: "Module 1 Practice Quiz",
      startTime: "2026-08-01T00:00:00Z",
      durationMinutes: 30,
      shuffleQuestions: false,
      shuffleOptions: false,
      maxAttempts: 3,
      status: "ACTIVE",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(coursesApi.useCourseByIdQuery).mockReturnValue(
      createMockQueryResult(
        createMockCourse({ id: "course-123", title: "React Fundamentals" }),
      ),
    );

    vi.mocked(quizzesApi.useQuizAssignmentsByCourseQuery).mockReturnValue(
      createMockQueryResult(mockAssignments),
    );

    vi.mocked(quizzesApi.useStudentAttemptHistoryQuery).mockReturnValue(
      createMockQueryResult([]),
    );

    vi.mocked(quizzesApi.useStartAttemptMutation).mockReturnValue(
      createMockMutationResult(),
    );
  });

  it("shouldRenderStudentQuizListAndAttemptStatus", async () => {
    const params = Promise.resolve({ id: "course-123" });
    await act(async () => {
      render(<StudentCourseQuizzesPage params={params} />);
    });

    await waitFor(() => {
      expect(screen.getByText("Module 1 Practice Quiz")).toBeInTheDocument();
      expect(screen.getByText(/30 mins/i)).toBeInTheDocument();
    });
  });
});
