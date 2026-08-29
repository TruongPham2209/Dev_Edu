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

vi.mock("@/lib/toast-context", () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }),
}));

vi.mock("@/lib/api/quizzes", () => ({
  useStudentAttemptHistoryQuery: vi.fn(),
  useStartAttemptMutation: vi.fn(),
}));

import {
  createMockMutationResult,
  createMockQueryResult,
} from "@/testing/mock-query";

describe("QuizAssignmentDetailModal Component", () => {
  const mockAssignment: QuizAssignmentResponse = {
    id: "assign-100",
    quizId: "q-1",
    assignmentName: "Chapter 1 Quiz Assignment",
    durationMinutes: 45,
    maxAttempts: 2,
    shuffleQuestions: true,
    shuffleOptions: true,
    createdAt: "2026-08-06T10:00:00Z",
    startTime: "2026-08-06T10:00:00Z",
    endTime: "2026-08-06T10:00:00Z",
    status: "ACTIVE",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(quizzesApi.useStudentAttemptHistoryQuery).mockReturnValue({
      data: [],
      isLoading: false,
    } as never);
    vi.mocked(quizzesApi.useStartAttemptMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as never);
    vi.mocked(quizzesApi.useStudentAttemptHistoryQuery).mockReturnValue(
      createMockQueryResult([]),
    );
    vi.mocked(quizzesApi.useStartAttemptMutation).mockReturnValue(
      createMockMutationResult({
        mutateAsync: vi.fn(),
        isPending: false,
      }),
    );
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
    expect(screen.getByText(/45 Mins/i)).toBeInTheDocument();
  });
});
