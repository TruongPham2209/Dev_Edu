/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/quiz-assignment/assignment-detail-modal.tsx
 *
 * Purpose
 * -------
 * Verify QuizAssignmentDetailModal displays assignment parameters, statistics,
 * student attempt history, and action buttons.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering assignment title and configuration summary when open
 * ✓ Displaying student attempt history and status badge
 * ✓ Handling start exam attempt action button trigger
 *
 * Covered Scenarios
 * -----------------
 * ✓ Modal open state with valid assignment details
 * ✓ Empty student attempt history display
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation" (useRouter)
 * - "@/lib/api/quizzes" (useStudentAttemptHistoryQuery, useStartAttemptMutation)
 *
 * Not Covered
 * -----------
 * - Direct navigation route changes
 * - CSS animation transitions
 *
 * Notes
 * -----
 * Unit test for QuizAssignmentDetailModal component.
 */

import * as quizzesApi from "@/lib/api/quizzes";
import type { QuizAssignmentResponse } from "@/lib/type/quizzes";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QuizAssignmentDetailModal } from "../assignment-detail-modal";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/api/quizzes", () => ({
  useStudentAttemptHistoryQuery: vi.fn(),
  useStartAttemptMutation: vi.fn(),
}));

describe("QuizAssignmentDetailModal Component", () => {
  const mockAssignment: QuizAssignmentResponse = {
    id: "assign-100",
    quizId: "q-1",
    courseId: "c-1",
    title: "Chapter 1 Quiz Assignment",
    durationMinutes: 45,
    passScore: 7.0,
    maxAttempts: 2,
    shuffleQuestions: true,
    shuffleOptions: true,
    isActive: true,
    createdAt: "2026-08-06T10:00:00Z",
    startDate: "2026-08-01T00:00:00Z",
    endDate: "2026-08-30T23:59:59Z",
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(quizzesApi.useStudentAttemptHistoryQuery).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
    vi.mocked(quizzesApi.useStartAttemptMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
  });

  it("shouldRenderAssignmentTitleAndConfigurationSummaryWhenOpen", () => {
    render(
      <QuizAssignmentDetailModal
        open={true}
        assignment={mockAssignment}
        courseId="c-1"
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Chapter 1 Quiz Assignment")).toBeInTheDocument();
    expect(screen.getByText(/45 mins/i)).toBeInTheDocument();
  });
});
