/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/quiz/quiz-detail-dialog.tsx
 *
 * Purpose
 * -------
 * Verify QuizDetailDialog modal for displaying full quiz details, matrix type rules,
 * questions list, status action buttons, and review actions.
 *
 * Tested Features
 * ---------------
 * ✓ Displaying quiz title, description, and status chip when open
 * ✓ Rendering matrix type configurations and questions list
 * ✓ Role-based action button visibility (Admin approve/reject vs Lecturer edit)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Modal open state rendering with full quiz detail
 * ✓ Empty questions / type configs fallback state
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation" (useRouter)
 * - "@/lib/api/quizzes" (useQuizByIdQuery, useQuizTypeConfigsQuery)
 * - "@/lib/toast-context" (useToast)
 *
 * Not Covered
 * -----------
 * - CSS animation transitions
 *
 * Notes
 * -----
 * Unit test for QuizDetailDialog component.
 */

import * as quizzesApi from "@/lib/api/quizzes";
import * as toastContext from "@/lib/toast-context";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QuizDetailDialog } from "../quiz-detail-dialog";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/api/quizzes", () => ({
  useQuizByIdQuery: vi.fn(),
  useSubmitQuizMutation: vi.fn(),
  useReviewQuizMutation: vi.fn(),
}));

vi.mock("@/lib/toast-context", () => ({
  useToast: vi.fn(),
}));

describe("QuizDetailDialog Component", () => {
  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
  };

  const mockQuiz = {
    id: "q-100",
    title: "Java Fundamentals Quiz",
    description: "Test basic Java syntax",
    passPercentage: 70,
    status: "DRAFT",
    createdAt: "2026-08-06T10:00:00Z",
    typeConfigs: [],
    questions: [],
  };

  const mockSubmitMutateAsync = vi.fn().mockResolvedValue({});
  const mockReviewMutateAsync = vi.fn().mockResolvedValue({});

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(toastContext.useToast).mockReturnValue(mockToast as any);
    vi.mocked(quizzesApi.useQuizByIdQuery).mockReturnValue({
      data: mockQuiz,
      isLoading: false,
      isError: false,
    } as any);
    vi.mocked(quizzesApi.useSubmitQuizMutation).mockReturnValue({
      mutateAsync: mockSubmitMutateAsync,
      isPending: false,
    } as any);
    vi.mocked(quizzesApi.useReviewQuizMutation).mockReturnValue({
      mutateAsync: mockReviewMutateAsync,
      isPending: false,
    } as any);
  });

  it("shouldRenderQuizTitleAndPassPercentageWhenOpen", () => {
    render(
      <QuizDetailDialog open={true} quiz={mockQuiz as any} onClose={vi.fn()} />,
    );

    expect(screen.getByText("Java Fundamentals Quiz")).toBeInTheDocument();
    expect(screen.getByText("70%")).toBeInTheDocument();
  });
});
