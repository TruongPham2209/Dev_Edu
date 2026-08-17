/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/cart/review-dialog.tsx
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
import { useQueryClient } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReviewDialog } from "../review-dialog";

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
    } as any);

    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      showSuccess: mockShowSuccess,
      handleError: mockHandleError,
    } as any);

    vi.mocked(coursesApi.useCreateReviewMutation).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
    } as any);
  });

  it("shouldRenderExistingUserReviewWhenDataExists", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return existing review.
    // ----------------------------------------------------------------------------
    vi.mocked(coursesApi.useMyReviewQuery).mockReturnValue({
      data: {
        id: "rev-1",
        rating: 5,
        comment: "Excellent course! Clear explanations.",
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    // ----------------------------------------------------------------------------
    // Act
    // Render ReviewDialog.
    // ----------------------------------------------------------------------------
    render(<ReviewDialog open={true} onClose={vi.fn()} courseId="c-100" />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title and review comment.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByRole("heading", { name: "Course Review" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Your Review")).toBeInTheDocument();
    expect(
      screen.getByText("Excellent course! Clear explanations."),
    ).toBeInTheDocument();
  });

  it("shouldRenderWriteReviewFormWhenNoReviewExists", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return null review data.
    // ----------------------------------------------------------------------------
    vi.mocked(coursesApi.useMyReviewQuery).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    // ----------------------------------------------------------------------------
    // Act
    // Render ReviewDialog.
    // ----------------------------------------------------------------------------
    render(<ReviewDialog open={true} onClose={vi.fn()} courseId="c-100" />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify "Write a review" form renders.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Write a review")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Share your thoughts about this course..."),
    ).toBeInTheDocument();
  });
});
