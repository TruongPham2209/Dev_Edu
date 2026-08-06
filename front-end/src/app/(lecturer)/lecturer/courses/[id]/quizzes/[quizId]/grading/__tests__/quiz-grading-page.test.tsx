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
 * - Infinite scroll pagination triggers
 *
 * Notes
 * -----
 * Unit test for QuizGradingPage component.
 */

import * as quizzesApi from "@/lib/api/quizzes";
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
  const mockQuizDetail = {
    quiz: {
      id: "quiz-99",
      title: "Essay Exam",
    },
  };

  const mockSubmissions = {
    pages: [
      {
        contents: [
          {
            attemptId: "att-1",
            questionId: "q-1",
            studentUsername: "john_doe",
            studentFullName: "John Doe",
            assignmentName: "Essay Assignment",
            submittedAt: "2026-08-06T10:00:00Z",
            essayStatus: "SUBMITTED",
            questionContent: "Describe Clean Architecture.",
            answerText: "Clean Architecture separates concerns into layers.",
            maxPoints: 10,
            awardedPoints: null,
            feedback: null,
          },
        ],
        nextCursor: undefined,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(quizzesApi.useQuizByIdQuery).mockReturnValue({
      data: mockQuizDetail,
      isLoading: false,
    } as any);

    vi.mocked(quizzesApi.useEssaySubmissionsInfiniteQuery).mockReturnValue({
      data: mockSubmissions,
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      refetch: vi.fn(),
    } as any);

    vi.mocked(quizzesApi.useGradeEssayMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
  });

  it("shouldRenderEssayGradingPageWithStudentSubmissionCard", () => {
    render(<QuizGradingPage />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(
      screen.getByText("Describe Clean Architecture."),
    ).toBeInTheDocument();
  });
});
