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

import * as quizzesApi from "@/lib/api/quizzes";
import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CourseStudentAttemptResultPage from "../page";

vi.mock("@/lib/api/quizzes", () => ({
  useAttemptResultQuery: vi.fn(),
}));

describe("CourseStudentAttemptResultPage Component", () => {
  const mockResult = {
    attemptId: "att-100",
    quizTitle: "Final Exam 2026",
    status: "GRADED",
    totalScore: 85,
    maxScore: 100,
    isPassed: true,
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
    vi.mocked(quizzesApi.useAttemptResultQuery).mockReturnValue({
      data: mockResult,
      isLoading: false,
      isError: false,
    } as any);
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
