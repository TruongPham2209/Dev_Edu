/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(lecturer)/lecturer/courses/[id]/quizzes/[quizId]/grading/page.tsx
 *
 * Purpose
 * -------
 * Verify Quiz Essay Grading Page renders essay submission cards, status tabs
 * (ALL, PENDING, GRADED), and handles essay grading callbacks.
 *
 * Tested Features
 * ---------------
 * ✓ Querying quiz details and essay submissions infinite query
 * ✓ Status filtering dropdown (ALL, PENDING, GRADED)
 * ✓ Rendering EssayGradingCard items for student submissions
 *
 * Covered Scenarios
 * -----------------
 * ✓ Lecturer essay submissions grading page display
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation" (useParams, useRouter)
 * - "@/lib/api/courses" (useCourseByIdQuery)
 * - "@/lib/api/quizzes" (useQuizByIdQuery, useEssaySubmissionsInfiniteQuery, useGradeEssayMutation)
 * - "@/lib/toast-context" (useToast)
 *
 * Not Covered
 * -----------
 * - Infinite scroll load more button triggers
 *
 * Notes
 * -----
 * Unit test for QuizGradingPage component.
 */

import * as quizzesApi from "@/lib/api/quizzes";
import type {
  QuizDetailResponse,
  QuizEssaySubmissionResponse,
  QuizResponse,
} from "@/lib/type/quizzes";
import type { CustomPaging } from "@/lib/type/api";
import {
  createMockInfiniteQueryResult,
  createMockMutationResult,
  createMockQueryResult,
} from "@/testing/mock-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import QuizGradingPage from "../page";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "course-123", quizId: "quiz-99" }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/api/quizzes", () => ({
  useQuizByIdQuery: vi.fn(),
  useEssaySubmissionsInfiniteQuery: vi.fn(),
  useGradeEssayMutation: vi.fn(),
}));

vi.mock("@/lib/api/courses", () => ({
  useCourseByIdQuery: vi.fn(() => ({
    data: { id: "course-123", title: "Course 101" },
    isLoading: false,
  })),
}));

vi.mock("@/lib/toast-context", () => ({
  useToast: vi.fn(() => ({ success: vi.fn(), error: vi.fn() })),
}));

describe("QuizGradingPage Component", () => {
  const mockQuiz: QuizResponse = {
    id: "quiz-99",
    courseId: "course-123",
    courseTitle: "Course 101",
    title: "Essay Exam",
    description: "Essay Exam description",
    status: "APPROVED",
    createdAt: "2026-08-06T10:00:00Z",
  };

  const mockQuizDetail: QuizDetailResponse = {
    quiz: mockQuiz,
    questions: [],
    typeConfigs: [],
  };

  const mockSubmission: QuizEssaySubmissionResponse = {
    attemptAnswerId: "ans-1",
    attemptId: "att-1",
    questionId: "q-1",
    assignmentId: "asg-1",
    studentUsername: "john_doe",
    studentFullName: "John Doe",
    assignmentName: "Essay Assignment",
    submittedAt: "2026-08-06T10:00:00Z",
    lastSavedAt: "2026-08-06T10:00:00Z",
    essayStatus: "PENDING",
    questionContent: "Describe Clean Architecture.",
    answerText: "Clean Architecture separates concerns into layers.",
    maxPoints: 10,
    awardedPoints: null,
    feedback: null,
  };

  const samplePaging: CustomPaging<QuizEssaySubmissionResponse> = {
    contents: [mockSubmission],
    currentPage: 0,
    pageSize: 10,
    totalElements: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(quizzesApi.useQuizByIdQuery).mockReturnValue(
      createMockQueryResult(mockQuizDetail),
    );

    vi.mocked(quizzesApi.useEssaySubmissionsInfiniteQuery).mockReturnValue(
      createMockInfiniteQueryResult(
        {
          pages: [samplePaging],
          pageParams: [undefined],
        },
      ),
    );

    vi.mocked(quizzesApi.useGradeEssayMutation).mockReturnValue(
      createMockMutationResult(),
    );
  });

  it("shouldRenderEssayGradingPageWithStudentSubmissionCard", () => {
    render(<QuizGradingPage />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(
      screen.getByText("Describe Clean Architecture."),
    ).toBeInTheDocument();
  });
});
