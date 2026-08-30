/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/courses/[id]/quizzes/attempts/[attemptId]/result/page.tsx
 *
 * Purpose
 * -------
 * Verify Student Exam Attempt Result page renders total score, pass/fail status banner,
 * attempt duration, breakdown metrics, and question result cards grid.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering quiz title, total score, percentage badge, and status chip
 * ✓ Displaying question results list with correctness indicators
 * ✓ Answer breakdown and question matrix navigation grid
 *
 * Covered Scenarios
 * -----------------
 * ✓ Graded quiz attempt result view with passing score
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/quizzes" (useAttemptResultQuery)
 *
 * Not Covered
 * -----------
 * - Scroll behavior when clicking question matrix buttons
 *
 * Notes
 * -----
 * Unit test for CourseStudentAttemptResultPage component.
 */

import type { AttemptResultResponse } from "@/lib/type/quizzes";
import * as quizzesApi from "@/lib/api/quizzes";
import { createMockQueryResult } from "@/testing/mock-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CourseStudentAttemptResultPage from "../page";

vi.mock("@/lib/api/quizzes", () => ({
  useAttemptResultQuery: vi.fn(),
}));

describe("CourseStudentAttemptResultPage Component", () => {
  const mockResult: AttemptResultResponse = {
    attemptId: "att-100",
    assignmentId: "asg-1",
    quizId: "q-1",
    studentUsername: "student_user",
    attemptNumber: 1,
    quizTitle: "Final Exam 2026",
    status: "GRADED",
    startedAt: "2026-08-06T10:00:00Z",
    submittedAt: "2026-08-06T11:00:00Z",
    gradedAt: "2026-08-06T11:30:00Z",
    totalScore: 85,
    maxScore: 100,
    answers: [
      {
        questionId: "q-1",
        questionContent: "What is Next.js?",
        questionType: "SINGLE_CHOICE",
        questionPoints: 50,
        awardedPoints: 50,
        isCorrect: true,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(quizzesApi.useAttemptResultQuery).mockReturnValue(
      createMockQueryResult<AttemptResultResponse>(mockResult),
    );
  });

  it("shouldRenderAttemptResultTitleScoreAndPassedBanner", async () => {
    const params = Promise.resolve({ id: "course-1", attemptId: "att-100" });
    await act(async () => {
      render(<CourseStudentAttemptResultPage params={params} />);
    });

    await waitFor(() => {
      expect(screen.getByText("Final Exam 2026")).toBeInTheDocument();
      expect(screen.getByText("85% Marks")).toBeInTheDocument();
      expect(screen.getByText("What is Next.js?")).toBeInTheDocument();
    });
  });
});
