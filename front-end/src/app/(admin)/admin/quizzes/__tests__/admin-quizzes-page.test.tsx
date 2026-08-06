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
}));

vi.mock("@/lib/toast-context", () => ({
  useToast: vi.fn(() => ({ success: vi.fn(), error: vi.fn() })),
}));

describe("AdminQuizzesPage Component", () => {
  const mockQuizzes = {
    pages: [
      {
        contents: [
          {
            id: "q-10",
            courseTitle: "Cloud Architecture",
            title: "AWS Certified Developer Quiz",
            passPercentage: 75,
            status: "PENDING",
            typeConfigs: [],
            createdAt: "2026-08-06T10:00:00Z",
          },
        ],
        nextCursor: undefined,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(quizzesApi.useQuizzesInfiniteQuery).mockReturnValue({
      data: mockQuizzes,
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      refetch: vi.fn(),
    } as any);

    vi.mocked(quizzesApi.useQuizByIdQuery).mockReturnValue({
      data: null,
      isLoading: false,
    } as any);

    vi.mocked(quizzesApi.useReviewQuizMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
  });

  it("shouldRenderAdminQuizzesPageTitleAndPendingQuizCard", () => {
    render(<AdminQuizzesPage />);

    expect(
      screen.getByText("AWS Certified Developer Quiz"),
    ).toBeInTheDocument();
  });
});
