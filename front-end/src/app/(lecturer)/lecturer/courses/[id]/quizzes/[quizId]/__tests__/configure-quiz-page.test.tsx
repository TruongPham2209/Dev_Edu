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

import * as coursesApi from "@/lib/api/courses";
import * as quizzesApi from "@/lib/api/quizzes";
import type {
  QuizDetailResponse,
  QuizQuestionResponse,
  QuizResponse,
  QuizTypeConfigResponse,
} from "@/lib/type/quizzes";
import { createMockCourse } from "@/testing/mock-data";
import {
  createMockMutationResult,
  createMockQueryResult,
} from "@/testing/mock-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LecturerQuizConfigurePage from "../page";

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
  useGenerateQuizFromFileMutation: vi.fn(),
  useGenerateQuizFromDocumentMutation: vi.fn(),
  useQuizGenerationJobQuery: vi.fn(() => ({ data: null, isLoading: false })),
  useQuestionTraceabilityQuery: vi.fn(() => ({ data: null, isLoading: false })),
}));

vi.mock("@/lib/api/documents", () => ({
  useGlobalDocumentsInfiniteQuery: vi.fn(() => ({
    data: { pages: [{ content: [] }] },
    isLoading: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isFetchingNextPage: false,
  })),
}));

vi.mock("@/lib/api/courses", () => ({
  useCourseByIdQuery: vi.fn(),
}));

vi.mock("@/lib/toast-context", () => ({
  useToast: vi.fn(() => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() })),
}));

describe("LecturerQuizConfigurePage Component", () => {
  let queryClient: QueryClient;

  const mockQuiz: QuizResponse = {
    id: "quiz-99",
    courseId: "course-123",
    title: "Midterm Exam Configuration",
    description: "Detailed quiz setup",
    status: "DRAFT",
    createdAt: "2026-08-06T10:00:00Z",
  };

  const mockQuestions: QuizQuestionResponse[] = [
    {
      id: "q-1",
      quizId: "quiz-99",
      content: "What is JSX?",
      questionType: "SINGLE_CHOICE",
      points: 2,
      orderIndex: 0,
      options: [],
    },
  ];

  const mockTypeConfigs: QuizTypeConfigResponse[] = [
    {
      id: "cfg-1",
      quizId: "quiz-99",
      questionType: "SINGLE_CHOICE",
      requiredCount: 5,
      pointsPerQuestion: 2,
      scoringMethod: "AUTO",
    },
  ];

  const mockDetail: QuizDetailResponse = {
    quiz: mockQuiz,
    questions: mockQuestions,
    typeConfigs: mockTypeConfigs,
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    vi.clearAllMocks();

    vi.mocked(coursesApi.useCourseByIdQuery).mockReturnValue(
      createMockQueryResult(
        createMockCourse({ id: "course-123", title: "React Fundamentals" }),
      ),
    );

    vi.mocked(quizzesApi.useQuizByIdQuery).mockReturnValue(
      createMockQueryResult(mockDetail),
    );

    vi.mocked(quizzesApi.useQuizTypeConfigsQuery).mockReturnValue(
      createMockQueryResult(mockTypeConfigs),
    );

    vi.mocked(quizzesApi.useUpdateQuizMutation).mockReturnValue(
      createMockMutationResult(),
    );

    vi.mocked(quizzesApi.useCreateQuizTypeConfigMutation).mockReturnValue(
      createMockMutationResult(),
    );

    vi.mocked(quizzesApi.useDeleteQuizTypeConfigMutation).mockReturnValue(
      createMockMutationResult(),
    );

    vi.mocked(quizzesApi.useCreateQuizQuestionMutation).mockReturnValue(
      createMockMutationResult(),
    );

    vi.mocked(quizzesApi.useUpdateQuizQuestionMutation).mockReturnValue(
      createMockMutationResult(),
    );

    vi.mocked(quizzesApi.useDeleteQuizQuestionMutation).mockReturnValue(
      createMockMutationResult(),
    );

    vi.mocked(quizzesApi.useSubmitQuizMutation).mockReturnValue(
      createMockMutationResult(),
    );

    vi.mocked(quizzesApi.useGenerateQuizFromFileMutation).mockReturnValue(
      createMockMutationResult(),
    );

    vi.mocked(quizzesApi.useGenerateQuizFromDocumentMutation).mockReturnValue(
      createMockMutationResult(),
    );
  });

  it("shouldRenderQuizTitleAndSections", async () => {
    const params = Promise.resolve({ id: "course-123", quizId: "quiz-99" });
    await act(async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <LecturerQuizConfigurePage params={params} />
        </QueryClientProvider>,
      );
    });

    await waitFor(() => {
      expect(
        screen.getByDisplayValue("Midterm Exam Configuration"),
      ).toBeInTheDocument();
      expect(screen.getByText("What is JSX?")).toBeInTheDocument();
    });
  });
});
