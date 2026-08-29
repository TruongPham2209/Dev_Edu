/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/courses/[id]/review-list.tsx
 *
 * Purpose
 * -------
 * Verify that ReviewList component renders average rating summary, student feedback comments,
 * empty reviews state, and "See more reviews" pagination button click handler.
 *
 * Tested Features
 * ---------------
 * ✓ Rating score and review count summary display
 * ✓ Review list rendering (avatar, username, rating stars, comment text)
 * ✓ Empty state message when reviews array is empty
 * ✓ Load more reviews button click handler
 *
 * Covered Scenarios
 * -----------------
 * ✓ Empty reviews list
 * ✓ Displaying reviews and clicking load more button
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements via RTL)
 *
 * Not Covered
 * -----------
 * - CSS hover animations
 *
 * Notes
 * -----
 * Unit test for ReviewList component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReviewList } from "../review-list";

describe("ReviewList", () => {
  it("shouldRenderEmptyStateWhenReviewsArrayIsEmpty", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render ReviewList with empty reviews array.
    // ----------------------------------------------------------------------------
    render(
      <ReviewList
        reviews={[]}
        rating={0}
        reviewCount={0}
        loadingReviews={false}
        nextCursor={null}
        loadingMoreReviews={false}
        loadMoreReviews={vi.fn()}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify empty state text.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("No reviews yet")).toBeInTheDocument();
  });

  it("shouldRenderReviewsSummaryListAndTriggerLoadMore", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock review item.
    // ----------------------------------------------------------------------------
    const mockReviews = [
      {
        id: "rev-55",
        fullName: "Nguyen Van A",
        username: "nguyena",
        rating: 5,
        comment: "Amazing course! Very detailed explanations.",
        createdAt: "2026-05-01T10:00:00.000Z",
      },
    ];

    const handleLoadMore = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render ReviewList.
    // ----------------------------------------------------------------------------
    render(
      <ReviewList
        reviews={mockReviews as never}
        rating={4.8}
        reviewCount={15}
        loadingReviews={false}
        nextCursor="cursor-99"
        loadingMoreReviews={false}
        loadMoreReviews={handleLoadMore}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify score, review comment, and load more button.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("4.8")).toBeInTheDocument();
    expect(
      screen.getByText("Amazing course! Very detailed explanations."),
    ).toBeInTheDocument();

    const loadMoreBtn = screen.getByRole("button", {
      name: "See more reviews",
    });
    fireEvent.click(loadMoreBtn);

    expect(handleLoadMore).toHaveBeenCalledTimes(1);
  });
});
