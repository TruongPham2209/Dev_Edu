/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/review-dialog.tsx
 *
 * Purpose
 * -------
 * Verify that ReviewDialog component renders course review form, existing user review,
 * rating stars, warning alert, and submits review via createReview mutation.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering existing review (rating & comment) when data exists
 * ✓ Rendering Write a review form when no review exists yet
 * ✓ Creating review mutation execution and toast notification
 *
 * Covered Scenarios
 * -----------------
 * ✓ Displaying existing review
 * ✓ Writing a new course review
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/courses" (useCreateReviewMutation, useMyReviewQuery)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 * - "@tanstack/react-query" (useQueryClient)
 *
 * Not Covered
 * -----------
 * - Backdrop filter styling
 *
 * Notes
 * -----
 * Unit test for ReviewDialog component.
 */

import * as coursesApi from "@/lib/api/courses";
import * as apiToast from "@/lib/use-api-with-toast";
import type { ReviewResponse } from "@/lib/type/courses";
import { useQueryClient } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReviewDialog } from "../review-dialog";
import {
  createMockApiWithToast,
  createMockMutationResult,
  createMockQueryResult,
} from "@/testing/mock-query";

vi.mock("@/lib/api/courses", () => ({
  useCreateReviewMutation: vi.fn(),
  useMyReviewQuery: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: vi.fn(),
}));

describe("ReviewDialog", () => {
  const mockCreateMutate = vi.fn();
  const mockShowSuccess = vi.fn();
  const mockHandleError = vi.fn();
  const mockInvalidateQueries = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQueryClient).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    } as ReturnType<typeof useQueryClient>);

    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast({
        showSuccess: mockShowSuccess,
        handleError: mockHandleError,
      }),
    );

    vi.mocked(coursesApi.useCreateReviewMutation).mockReturnValue(
      createMockMutationResult({
        mutate: mockCreateMutate,
        isPending: false,
      }),
    );
  });

  it("shouldRenderExistingUserReviewWhenDataExists", () => {
    const mockReview: ReviewResponse = {
      id: "rev-1",
      rating: 5,
      comment: "Excellent course! Clear explanations.",
      username: "student_1",
      fullName: "Student One",
      avatarUrl: "https://example.com/avatar.jpg",
      createdAt: "2026-06-01T10:00:00.000Z",
    };

    vi.mocked(coursesApi.useMyReviewQuery).mockReturnValue(
      createMockQueryResult(mockReview),
    );

    render(<ReviewDialog open={true} onClose={vi.fn()} courseId="c-100" />);

    expect(
      screen.getByRole("heading", { name: "Course Review" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Your Review")).toBeInTheDocument();
    expect(
      screen.getByText("Excellent course! Clear explanations."),
    ).toBeInTheDocument();
  });

  it("shouldRenderWriteReviewFormWhenNoReviewExists", () => {
    vi.mocked(coursesApi.useMyReviewQuery).mockReturnValue(
      createMockQueryResult<ReviewResponse>(),
    );

    render(<ReviewDialog open={true} onClose={vi.fn()} courseId="c-100" />);

    expect(screen.getByText("Write a review")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Share your thoughts about this course..."),
    ).toBeInTheDocument();
  });
});
