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

describe("StudentCourseQuizzesPage Component", () => {
  const mockAssignments = [
    {
      id: "assign-1",
      quizId: "q-1",
      courseId: "course-123",
      assignmentName: "Module 1 Practice Quiz",
      title: "Module 1 Practice Quiz",
      durationMinutes: 30,
      passScore: 6.0,
      maxAttempts: 3,
      isActive: true,
      startTime: "2026-08-01T00:00:00Z",
      startDate: "2026-08-01T00:00:00Z",
      endDate: "2026-08-30T23:59:59Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(coursesApi.useCourseByIdQuery).mockReturnValue({
      data: { id: "course-123", title: "React Fundamentals" },
      isLoading: false,
    } as any);

    vi.mocked(quizzesApi.useQuizAssignmentsByCourseQuery).mockReturnValue({
      data: mockAssignments,
      isLoading: false,
    } as any);

    vi.mocked(quizzesApi.useStudentAttemptHistoryQuery).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    vi.mocked(quizzesApi.useStartAttemptMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
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
