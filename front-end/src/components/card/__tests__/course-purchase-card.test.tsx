/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/card/course-purchase-card.tsx
 *
 * Purpose
 * -------
 * Verify that CoursePurchaseCard component renders course purchase pricing,
 * enrollment start learning button vs buy now / add to cart buttons, loading spinners,
 * and handles click events.
 *
 * Tested Features
 * ---------------
 * ✓ Price calculation (Free, discount calculation, strike-through original price)
 * ✓ Enrolled view: "Start learning" button with lecture link
 * ✓ Unenrolled view: "Register now" and "Add to cart" action buttons
 * ✓ Action loading state ("cart" loading indicator & disabled states)
 * ✓ Student login required notice when showPurchase is false
 * ✓ Lesson count display from lectures prop
 *
 * Covered Scenarios
 * -----------------
 * ✓ User is enrolled (isEnrolled: true)
 * ✓ User is not enrolled (isEnrolled: false)
 * ✓ User clicks "Register now"
 * ✓ User clicks "Add to cart"
 * ✓ loadingAction === "cart" (spinner state)
 * ✓ showPurchase === false (warning message rendered)
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements & Next.js Link via RTL)
 *
 * Not Covered
 * -----------
 * - Backdrop blur styling
 *
 * Notes
 * -----
 * Unit test for CoursePurchaseCard component.
 */

import type { CourseResponse } from "@/lib/type/courses";
import type { LectureResponse } from "@/lib/type/lectures";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CoursePurchaseCard } from "../course-purchase-card";

describe("CoursePurchaseCard", () => {
  const baseCourse: CourseResponse = {
    id: "course-123",
    title: "TypeScript Deep Dive",
    originalPrice: 400000,
    discountedPercentage: 25, // displayPrice = 300000
    thumbnailUrl: "https://example.com/thumb.jpg",
  } as never;

  const mockLectures: LectureResponse[] = [
    { id: "lec-1", title: "Lesson 1" } as never,
    { id: "lec-2", title: "Lesson 2" } as never,
  ];

  it("shouldRenderStartLearningButtonWhenUserIsEnrolled", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render purchase card with isEnrolled = true.
    // ----------------------------------------------------------------------------
    render(
      <CoursePurchaseCard
        course={baseCourse}
        isEnrolled={true}
        lectures={mockLectures}
        handleBuyNow={vi.fn()}
        handleAddToCart={vi.fn()}
        loadingAction={null}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify "Start learning" button and lecture link.
    // ----------------------------------------------------------------------------
    const startBtn = screen.getByRole("link", { name: /Start learning/i });
    expect(startBtn).toBeInTheDocument();
    expect(startBtn).toHaveAttribute("href", "/courses/course-123/lectures");
    expect(screen.getByText("2 lessons")).toBeInTheDocument();
  });

  it("shouldRenderBuyNowAndAddToCartButtonsWhenUserIsNotEnrolled", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare action handlers.
    // ----------------------------------------------------------------------------
    const handleBuyNow = vi.fn();
    const handleAddToCart = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render purchase card with isEnrolled = false.
    // ----------------------------------------------------------------------------
    render(
      <CoursePurchaseCard
        course={baseCourse}
        isEnrolled={false}
        lectures={mockLectures}
        handleBuyNow={handleBuyNow}
        handleAddToCart={handleAddToCart}
        loadingAction={null}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify calculated prices and action buttons.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("300.000đ")).toBeInTheDocument();
    expect(screen.getByText("400.000đ")).toBeInTheDocument();

    const buyBtn = screen.getByRole("button", { name: "Register now" });
    const cartBtn = screen.getByRole("button", { name: "Add to cart" });
    expect(buyBtn).toBeInTheDocument();
    expect(cartBtn).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click buttons and verify handlers are invoked.
    // ----------------------------------------------------------------------------
    fireEvent.click(buyBtn);
    expect(handleBuyNow).toHaveBeenCalledTimes(1);

    fireEvent.click(cartBtn);
    expect(handleAddToCart).toHaveBeenCalledTimes(1);
  });

  it("shouldDisableButtonsAndShowLoadingTextWhenLoadingActionIsCart", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render component with loadingAction = "cart".
    // ----------------------------------------------------------------------------
    render(
      <CoursePurchaseCard
        course={baseCourse}
        isEnrolled={false}
        lectures={mockLectures}
        handleBuyNow={vi.fn()}
        handleAddToCart={vi.fn()}
        loadingAction="cart"
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify buttons are disabled and cart button shows "Processing...".
    // ----------------------------------------------------------------------------
    const buyBtn = screen.getByRole("button", { name: "Register now" });
    const cartBtn = screen.getByRole("button", { name: "Processing..." });

    expect(buyBtn).toBeDisabled();
    expect(cartBtn).toBeDisabled();
  });

  it("shouldDisplayNoticeWhenShowPurchaseIsFalse", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render component with showPurchase = false.
    // ----------------------------------------------------------------------------
    render(
      <CoursePurchaseCard
        course={baseCourse}
        isEnrolled={false}
        lectures={mockLectures}
        handleBuyNow={vi.fn()}
        handleAddToCart={vi.fn()}
        loadingAction={null}
        showPurchase={false}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify login warning text renders.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Please login with student account to buy this course"),
    ).toBeInTheDocument();
  });
});
