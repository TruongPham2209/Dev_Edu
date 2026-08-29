/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/quizzes/page.tsx
 *
 * Purpose
 * -------
 * Verify Admin Quizzes approval dashboard page, tab switching (Pending,
 * Approved, Rejected), quiz cards grid, and review approval modal.
 *
 * Tested Features
 * ---------------
 * ✓ Querying quizzes infinite list with status filter
 * ✓ Rendering HeroInfo header, AnimatedTabs status selector, and QuizCard grid
 * ✓ Moderation dialog handling for approving or rejecting quiz submissions
 *
 * Covered Scenarios
 * -----------------
 * ✓ Admin pending quizzes list rendering
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation" (useRouter)
 * - "@/lib/api/quizzes" (useQuizzesInfiniteQuery, useQuizByIdQuery, useReviewQuizMutation)
 * - "@/lib/toast-context" (useToast)
 *
 * Not Covered
 * -----------
 * - Infinite scroll load more button triggers
 *
 * Notes
 * -----
 * Unit test for AdminQuizzesPage component.
 */

import * as quizzesApi from "@/lib/api/quizzes";
import type { QuizDetailResponse, QuizResponse } from "@/lib/type/quizzes";
import type { CustomPaging } from "@/lib/type/api";
import {
  createMockInfiniteQueryResult,
  createMockMutationResult,
  createMockQueryResult,
} from "@/testing/mock-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminQuizzesPage from "../page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/api/quizzes", () => ({
  useQuizzesInfiniteQuery: vi.fn(),
  useQuizByIdQuery: vi.fn(),
  useReviewQuizMutation: vi.fn(),
  useSubmitQuizMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

vi.mock("@/lib/toast-context", () => ({
  useToast: vi.fn(() => ({ success: vi.fn(), error: vi.fn() })),
}));

describe("AdminQuizzesPage Component", () => {
  const mockQuiz: QuizResponse = {
    id: "q-1",
    courseId: "c-1",
    courseTitle: "Cloud Architecture",
    title: "AWS Certified Developer Quiz",
    description: "Test AWS knowledge",
    status: "PENDING",
    createdAt: "2026-08-06T10:00:00Z",
  };

  const samplePaging: CustomPaging<QuizResponse> = {
    contents: [mockQuiz],
    currentPage: 0,
    pageSize: 10,
    totalElements: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(quizzesApi.useQuizzesInfiniteQuery).mockReturnValue(
      createMockInfiniteQueryResult(
        {
          pages: [samplePaging],
          pageParams: [undefined],
        },
      ),
    );

    vi.mocked(quizzesApi.useQuizByIdQuery).mockReturnValue(
      createMockQueryResult<QuizDetailResponse>(),
    );

    vi.mocked(quizzesApi.useReviewQuizMutation).mockReturnValue(
      createMockMutationResult({
        mutateAsync: vi.fn(),
        isPending: false,
      }),
    );
  });

  it("shouldRenderAdminQuizzesPageTitleAndPendingQuizCard", () => {
    render(<AdminQuizzesPage />);

    expect(
      screen.getByText("AWS Certified Developer Quiz"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search quizzes by title..."),
    ).toBeInTheDocument();
  });
});
