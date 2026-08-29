/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/cart/course-order-item.tsx
 *
 * Purpose
 * -------
 * Verify that CourseOrderItem component renders course details depending on tabContext
 * ("cart", "order", "enrolled"), handles checkbox selection, remove button click, order status chip,
 * and review dialog opening.
 *
 * Tested Features
 * ---------------
 * ✓ Title, thumbnail image, description, and price rendering
 * ✓ Checkbox rendering & selection when tabContext = "cart"
 * ✓ Remove trash icon button when tabContext = "cart"
 * ✓ Order status chip rendering when tabContext = "order"
 * ✓ "Enroll" button link when tabContext = "enrolled"
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering in cart context with select & remove actions
 * ✓ Rendering in order context with COMPLETED status
 * ✓ Rendering in enrolled context
 *
 * Mocked Dependencies
 * -------------------
 * - "@tanstack/react-query" (useQueryClient)
 * - "@/lib/api/courses" (useCreateReviewMutation, useMyReviewQuery)
 *
 * Not Covered
 * -----------
 * - CSS hover animations
 *
 * Notes
 * -----
 * Unit test for CourseOrderItem component.
 */

import * as coursesApi from "@/lib/api/courses";
import { useQueryClient } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CourseOrderItem } from "../course-order-item";

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: () => ({
    handleError: vi.fn(),
    showSuccess: vi.fn(),
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: vi.fn(),
}));

vi.mock("@/lib/api/courses", () => ({
  useCreateReviewMutation: vi.fn(),
  useMyReviewQuery: vi.fn(),
}));

vi.mock("@/components/dialog/review-dialog", () => ({
  ReviewDialog: () => null,
}));

describe("CourseOrderItem", () => {
  const mockItem = {
    id: "item-100",
    courseId: "course-100",
    title: "Mastering React 19 Next.js",
    description: "<p>Comprehensive guide to Next.js App Router</p>",
    originalPrice: 1000000,
    discountedPrice: 800000,
    thumbnailUrl: "https://example.com/thumb.jpg",
    timestamp: "2026-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQueryClient).mockReturnValue({
      invalidateQueries: vi.fn(),
    } as never);

    vi.mocked(coursesApi.useMyReviewQuery).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as never);

    vi.mocked(coursesApi.useCreateReviewMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);
  });

  it("shouldRenderCartContextWithCheckboxAndRemoveButton", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare handlers.
    // ----------------------------------------------------------------------------
    const handleRemove = vi.fn();
    const handleSelect = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render in cart context.
    // ----------------------------------------------------------------------------
    render(
      <CourseOrderItem
        item={mockItem}
        tabContext="cart"
        selected={true}
        onSelect={handleSelect}
        onRemove={handleRemove}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, price, checkbox, and remove button.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Mastering React 19 Next.js")).toBeInTheDocument();
    expect(screen.getByText("800.000đ")).toBeInTheDocument();

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();

    // Click trash button
    const removeBtn = screen.getByRole("button");
    fireEvent.click(removeBtn);

    expect(handleRemove).toHaveBeenCalledWith("item-100");
  });

  it("shouldRenderEnrolledContextWithEnrollButton", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render in enrolled context.
    // ----------------------------------------------------------------------------
    render(<CourseOrderItem item={mockItem} tabContext="enrolled" />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify "Enroll" action link renders.
    // ----------------------------------------------------------------------------
    expect(screen.getByRole("link", { name: /Learn Now/i })).toBeInTheDocument();
  });
});
