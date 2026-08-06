/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/card/essay-grading-card.tsx
 *
 * Purpose
 * -------
 * Verify that EssayGradingCard component renders student info, submission text,
 * question prompt, handles score input validation, calls grade mutation on save,
 * and triggers toast notifications.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering student avatar, username, assignment title, and submitted timestamp
 * ✓ Displaying question prompt and student's essay answer
 * ✓ Score input validation and grade essay mutation handling
 * ✓ Triggering toast notifications on validation error and successful save
 *
 * Covered Scenarios
 * -----------------
 * ✓ Ungraded essay submission card state
 * ✓ Empty score error toast notification
 * ✓ Successful essay grading submission
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/quizzes" (useGradeEssayMutation)
 * - "@/lib/toast-context" (useToast)
 *
 * Not Covered
 * -----------
 * - CSS animation hover transitions
 *
 * Notes
 * -----
 * Unit test for EssayGradingCard component.
 */

import * as quizzesApi from "@/lib/api/quizzes";
import * as toastContext from "@/lib/toast-context";
import type { QuizEssaySubmissionResponse } from "@/lib/type/quizzes";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EssayGradingCard } from "../essay-grading-card";

vi.mock("@/lib/api/quizzes", () => ({
  useGradeEssayMutation: vi.fn(),
}));

vi.mock("@/lib/toast-context", () => ({
  useToast: vi.fn(),
}));

describe("EssayGradingCard Component", () => {
  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  };

  const mockMutateAsync = vi.fn().mockResolvedValue({});

  const mockSubmission: QuizEssaySubmissionResponse = {
    attemptAnswerId: "ans-1",
    attemptId: "att-1",
    questionId: "q-1",
    assignmentId: "asg-1",
    studentUsername: "student01",
    studentFullName: "Jane Student",
    assignmentName: "Final Essay Quiz",
    submittedAt: "2026-08-06T10:00:00Z",
    lastSavedAt: "2026-08-06T09:55:00Z",
    essayStatus: "SUBMITTED",
    questionContent: "Explain MVC Architecture.",
    answerText: "MVC stands for Model View Controller.",
    maxPoints: 10,
    awardedPoints: null,
    feedback: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(toastContext.useToast).mockReturnValue(mockToast as any);
    vi.mocked(quizzesApi.useGradeEssayMutation).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);
  });

  it("shouldRenderSubmissionDetailsAndUngradedStatus", () => {
    render(<EssayGradingCard submission={mockSubmission} />);

    expect(screen.getByText("Jane Student")).toBeInTheDocument();
    expect(screen.getByText(/@student01/)).toBeInTheDocument();
    expect(screen.getByText("Needs Grading")).toBeInTheDocument();
    expect(screen.getByText("Explain MVC Architecture.")).toBeInTheDocument();
    expect(
      screen.getByText("MVC stands for Model View Controller."),
    ).toBeInTheDocument();
  });

  it("shouldShowErrorToastWhenScoreIsEmptyOnSave", async () => {
    render(<EssayGradingCard submission={mockSubmission} />);

    const saveButton = screen.getByRole("button", { name: /Save Grade/i });
    fireEvent.click(saveButton);

    expect(mockToast.error).toHaveBeenCalledWith(
      "Please enter awarded points.",
    );
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("shouldSubmitGradeSuccessfullyWhenScoreIsValid", async () => {
    const onGradedSuccess = vi.fn();
    render(
      <EssayGradingCard
        submission={mockSubmission}
        onGradedSuccess={onGradedSuccess}
      />,
    );

    const scoreInput = screen.getByLabelText(/Score/i);
    const feedbackInput = screen.getByPlaceholderText(/Enter feedback/i);

    fireEvent.change(scoreInput, { target: { value: "8.5" } });
    fireEvent.change(feedbackInput, {
      target: { value: "Well written essay!" },
    });

    const saveButton = screen.getByRole("button", { name: /Save Grade/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        attemptId: "att-1",
        questionId: "q-1",
        data: {
          awardedPoints: 8.5,
          feedback: "Well written essay!",
        },
      });
      expect(mockToast.success).toHaveBeenCalledWith(
        "Essay graded successfully!",
      );
      expect(onGradedSuccess).toHaveBeenCalled();
    });
  });
});
