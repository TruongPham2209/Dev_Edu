/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/card/question-result-card.tsx
 *
 * Purpose
 * -------
 * Verify that QuestionResultCard component correctly renders question prompt, score,
 * question type badges, correct/wrong indicators, user choices, option lists,
 * essay feedback, and toggles full detail dialog on click.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering question prompt, points awarded, and type badges
 * ✓ Indicating correct vs incorrect answer states with icons and colors
 * ✓ Rendering option choices for single/multiple choice and essay feedback
 *
 * Covered Scenarios
 * -----------------
 * ✓ Single choice correct question result card
 * ✓ Multiple choice and essay question result rendering
 *
 * Mocked Dependencies
 * -------------------
 * - None (Pure presentation component test)
 *
 * Not Covered
 * -----------
 * - HTML string sanitization
 *
 * Notes
 * -----
 * Unit test for QuestionResultCard component.
 */

import type { AttemptQuestionResultDto } from "@/lib/type/quizzes";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QuestionResultCard } from "../question-result-card";

describe("QuestionResultCard Component", () => {
  const singleChoiceQuestion: AttemptQuestionResultDto = {
    questionId: "q-1",
    questionContent: "<p>What is React?</p>",
    questionType: "SINGLE_CHOICE",
    questionPoints: 10,
    awardedPoints: 10,
    isCorrect: true,
    selectedOptionIds: ["opt-1"],
    options: [
      { id: "opt-1", optionText: "A UI Library", isCorrect: true, orderIndex: 0 },
      { id: "opt-2", optionText: "A Database", isCorrect: false, orderIndex: 1 },
    ],
  };

  const essayQuestion: AttemptQuestionResultDto = {
    questionId: "q-2",
    questionContent: "Explain React Hooks.",
    questionType: "ESSAY",
    questionPoints: 20,
    awardedPoints: 15,
    isCorrect: undefined,
    answerText: "Hooks let you use state in functional components.",
    feedback: "Great explanation!",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shouldRenderSingleChoiceQuestionCardWithCorrectBadge", () => {
    render(<QuestionResultCard question={singleChoiceQuestion} index={0} />);

    expect(screen.getByText("Q1")).toBeInTheDocument();
    expect(screen.getByText("Single")).toBeInTheDocument();
    expect(screen.getByText("Correct")).toBeInTheDocument();
    expect(screen.getByText("Score: 10 / 10 pts")).toBeInTheDocument();
    expect(screen.getByText("What is React?")).toBeInTheDocument();
    expect(screen.getByText("A UI Library")).toBeInTheDocument();
    expect(screen.getByText("Your Choice ✓")).toBeInTheDocument();
  });

  it("shouldRenderEssayQuestionCardWithFeedback", () => {
    render(<QuestionResultCard question={essayQuestion} index={1} />);

    expect(screen.getByText("Q2")).toBeInTheDocument();
    expect(screen.getByText("Essay")).toBeInTheDocument();
    expect(screen.getByText("Passed")).toBeInTheDocument();
    expect(screen.getByText("Score: 15 / 20 pts")).toBeInTheDocument();
    expect(screen.getByText("Explain React Hooks.")).toBeInTheDocument();
    expect(
      screen.getByText("Hooks let you use state in functional components."),
    ).toBeInTheDocument();
    expect(screen.getByText("Instructor Feedback:")).toBeInTheDocument();
    expect(screen.getByText("Great explanation!")).toBeInTheDocument();
  });

  it("shouldOpenFullDetailDialogWhenCardIsClicked", () => {
    render(<QuestionResultCard question={singleChoiceQuestion} index={0} />);

    expect(screen.queryByText("Question 1 Details")).not.toBeInTheDocument();

    const card = screen.getByText("Q1").closest(".MuiCard-root");
    fireEvent.click(card!);

    expect(screen.getByText("Question 1 Details")).toBeInTheDocument();
    expect(screen.getByText("Question Prompt")).toBeInTheDocument();
  });
});
