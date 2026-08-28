import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuestionsSection } from "../questions-section";
import type {
  QuizTypeConfigResponse,
  QuizQuestionResponse,
} from "@/lib/type/quizzes";

describe("QuestionsSection Component - AI Generation & UI Guard", () => {
  const mockTypeConfigs: QuizTypeConfigResponse[] = [
    {
      id: "cfg-1",
      quizId: "q-1",
      questionType: "SINGLE_CHOICE",
      requiredCount: 5,
      pointsPerQuestion: 2,
    },
    {
      id: "cfg-2",
      quizId: "q-1",
      questionType: "MULTIPLE_CHOICE",
      requiredCount: 3,
      pointsPerQuestion: 3,
    },
  ];

  const mockQuestions: QuizQuestionResponse[] = [
    {
      id: "q-1",
      quizId: "q-1",
      questionType: "SINGLE_CHOICE",
      content: "What is React?",
      points: 2,
      orderIndex: 0,
      options: [
        { id: "opt-1", content: "Library", isCorrect: true },
        { id: "opt-2", content: "Database", isCorrect: false },
      ],
    },
  ];

  const defaultProps = {
    typeConfigs: mockTypeConfigs,
    questions: mockQuestions,
    totalRequiredQuestions: 8,
    isPendingStatus: false,
    onAddQuestion: vi.fn(),
    onEditQuestion: vi.fn(),
    onDuplicateQuestion: vi.fn(),
    onDeleteQuestion: vi.fn(),
    onImportQuestions: vi.fn(),
    onOpenAiGenerator: vi.fn(),
    onViewTraceability: vi.fn(),
    hasActiveJobId: true,
  };

  it("should enable 'Generate with AI' button when slots remain and not pending", () => {
    render(<QuestionsSection {...defaultProps} />);

    // Total required = 5 + 3 = 8. Existing questions = 1 SINGLE_CHOICE. Remaining = 4 + 3 = 7 slots.
    const aiBtn = screen.getByRole("button", {
      name: /Generate with AI \(7 slots\)/i,
    });
    expect(aiBtn).toBeInTheDocument();
    expect(aiBtn).not.toBeDisabled();

    fireEvent.click(aiBtn);
    expect(defaultProps.onOpenAiGenerator).toHaveBeenCalled();
  });

  it("should disable 'Generate with AI' button when quiz is pending approval", () => {
    render(<QuestionsSection {...defaultProps} isPendingStatus={true} />);

    const aiBtn = screen.getByRole("button", {
      name: /Generate with AI/i,
    });
    expect(aiBtn).toBeDisabled();
  });

  it("should disable 'Generate with AI' button when no type configs are defined", () => {
    render(<QuestionsSection {...defaultProps} typeConfigs={[]} />);

    const aiBtn = screen.getByRole("button", {
      name: /Generate with AI \(0 slots\)/i,
    });
    expect(aiBtn).toBeDisabled();
  });

  it("should disable 'Generate with AI' button when all matrix slots are filled", () => {
    // 5 SINGLE_CHOICE and 3 MULTIPLE_CHOICE questions
    const filledQuestions: QuizQuestionResponse[] = [
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `sc-${i}`,
        quizId: "q-1",
        questionType: "SINGLE_CHOICE" as const,
        content: `Single choice ${i}`,
        points: 2,
        orderIndex: i,
        options: [],
      })),
      ...Array.from({ length: 3 }, (_, i) => ({
        id: `mc-${i}`,
        quizId: "q-1",
        questionType: "MULTIPLE_CHOICE" as const,
        content: `Multi choice ${i}`,
        points: 3,
        orderIndex: 5 + i,
        options: [],
      })),
    ];

    render(
      <QuestionsSection
        {...defaultProps}
        questions={filledQuestions}
      />,
    );

    const aiBtn = screen.getByRole("button", {
      name: /Generate with AI \(0 slots\)/i,
    });
    expect(aiBtn).toBeDisabled();
  });

  it("should render Traceability button on question card and trigger onViewTraceability", () => {
    render(<QuestionsSection {...defaultProps} />);

    const traceabilityBtn = screen.getByRole("button", {
      name: /Traceability/i,
    });
    expect(traceabilityBtn).toBeInTheDocument();

    fireEvent.click(traceabilityBtn);
    expect(defaultProps.onViewTraceability).toHaveBeenCalledWith(
      mockQuestions[0],
    );
  });
});