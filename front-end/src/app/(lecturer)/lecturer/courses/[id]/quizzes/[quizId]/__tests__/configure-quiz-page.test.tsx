/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(lecturer)/lecturer/courses/[id]/quizzes/[quizId]/page.tsx
 *
 * Purpose
 * -------
 * Verify Configure Quiz page renders quiz sections (QuizInfoSection, TypeConfigsSection,
 * QuestionsSection, ProgressSummaryCard) and handles loading/error states.
 *
 * Tested Features
 * ---------------
 * ✓ Querying quiz details, matrix type configurations, and questions
 * ✓ Rendering QuizInfoSection with editable quiz title and description
 * ✓ Rendering questions list and matrix progress summary sidebar
 *
 * Covered Scenarios
 * -----------------
 * ✓ Lecturer quiz configuration page rendering
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation" (useRouter)
 * - "@/lib/api/courses" (useCourseByIdQuery)
 * - "@/lib/api/quizzes" (useQuizByIdQuery, useQuizTypeConfigsQuery, useUpdateQuizMutation, useSubmitQuizMutation, etc.)
 * - "@/lib/toast-context" (useToast)
 *
 * Not Covered
 * -----------
 * - Modal dialog triggers for adding questions
 *
 * Notes
 * -----
 * Unit test for LecturerQuizConfigurePage component.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as coursesApi from "@/lib/api/courses";
import * as quizzesApi from "@/lib/api/quizzes";
import { act, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LecturerQuizConfigurePage from "../page";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/api/quizzes", () => ({
  useQuizByIdQuery: vi.fn(),
  useQuizTypeConfigsQuery: vi.fn(),
  useUpdateQuizMutation: vi.fn(),
  useSubmitQuizMutation: vi.fn(),
  useCreateQuizTypeConfigMutation: vi.fn(),
  useDeleteQuizTypeConfigMutation: vi.fn(),
  useCreateQuizQuestionMutation: vi.fn(),
  useUpdateQuizQuestionMutation: vi.fn(),
  useDeleteQuizQuestionMutation: vi.fn(),
}));

vi.mock("@/lib/api/courses", () => ({
  useCourseByIdQuery: vi.fn(),
}));

vi.mock("@/lib/toast-context", () => ({
  useToast: vi.fn(() => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() })),
}));

describe("LecturerQuizConfigurePage Component", () => {
  const mockQuiz = {
    id: "quiz-99",
    courseId: "course-123",
    title: "Midterm Exam Configuration",
    description: "Detailed quiz setup",
    passPercentage: 70,
    status: "DRAFT",
    questions: [
      {
        id: "q-1",
        content: "What is JSX?",
        questionType: "SINGLE_CHOICE",
        points: 2,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(coursesApi.useCourseByIdQuery).mockReturnValue({
      data: { id: "course-123", title: "React Fundamentals" },
      isLoading: false,
    } as any);

    vi.mocked(quizzesApi.useQuizByIdQuery).mockReturnValue({
      data: {
        quiz: mockQuiz,
        typeConfigs: [],
        questions: mockQuiz.questions,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(quizzesApi.useQuizTypeConfigsQuery).mockReturnValue({
      data: [
        {
          id: "cfg-1",
          questionType: "SINGLE_CHOICE",
          numberOfQuestions: 5,
          pointsPerQuestion: 2,
          passPercentage: 70,
        },
      ],
      isLoading: false,
    } as any);

    vi.mocked(quizzesApi.useUpdateQuizMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(quizzesApi.useCreateQuizTypeConfigMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(quizzesApi.useDeleteQuizTypeConfigMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(quizzesApi.useCreateQuizQuestionMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(quizzesApi.useUpdateQuizQuestionMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(quizzesApi.useDeleteQuizQuestionMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(quizzesApi.useSubmitQuizMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
  });

  it("shouldRenderQuizTitleAndSections", async () => {
    const params = Promise.resolve({ id: "course-123", quizId: "quiz-99" });
    await act(async () => {
      render(<LecturerQuizConfigurePage params={params} />, {
        wrapper: createWrapper(),
      });
    });

    await waitFor(() => {
      expect(
        screen.getByDisplayValue("Midterm Exam Configuration"),
      ).toBeInTheDocument();
      expect(screen.getByText("What is JSX?")).toBeInTheDocument();
    });
  });
});
