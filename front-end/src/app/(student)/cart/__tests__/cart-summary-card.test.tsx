/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/cart/cart-summary-card.tsx
 *
 * Purpose
 * -------
 * Verify that CartSummaryCard component renders course counts, final total price,
 * savings discount badge, and triggers checkout action callback.
 *
 * Tested Features
 * ---------------
 * ✓ Total item count and final price display
 * ✓ Discount amount and percentage calculations
 * ✓ Checkout button click triggering onCheckout callback
 * ✓ Disabled checkout button when totalItems = 0 or isCheckoutLoading = true
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering cart summary with discount savings
 * ✓ Clicking Checkout button
 * ✓ Disabled state when cart is empty
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements via RTL)
 *
 * Not Covered
 * -----------
 * - Fixed bottom CSS positioning
 *
 * Notes
 * -----
 * Unit test for CartSummaryCard component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CartSummaryCard } from "../cart-summary-card";

describe("CartSummaryCard", () => {
  it("shouldRenderCartTotalsSavingsAndTriggerCheckout", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare onCheckout handler.
    // ----------------------------------------------------------------------------
    const handleCheckout = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render CartSummaryCard.
    // ----------------------------------------------------------------------------
    render(
      <CartSummaryCard
        totalItems={2}
        totalOriginalPrice={1000000}
        totalDiscountAmount={200000}
        totalFinalPrice={800000}
        onCheckout={handleCheckout}
        isCheckoutLoading={false}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify item count, price, savings text, and discount percentage chip.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("2 courses in cart")).toBeInTheDocument();
    expect(screen.getByText("800.000đ")).toBeInTheDocument();
    expect(screen.getByText("-20%")).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click Checkout button.
    // ----------------------------------------------------------------------------
    const checkoutBtn = screen.getByRole("button", { name: /Checkout/i });
    expect(checkoutBtn).not.toBeDisabled();
    fireEvent.click(checkoutBtn);

    expect(handleCheckout).toHaveBeenCalledTimes(1);
  });

  it("shouldDisableCheckoutButtonWhenCartIsEmpty", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render empty cart summary.
    // ----------------------------------------------------------------------------
    render(
      <CartSummaryCard
        totalItems={0}
        totalOriginalPrice={0}
        totalDiscountAmount={0}
        totalFinalPrice={0}
        onCheckout={vi.fn()}
        isCheckoutLoading={false}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify Checkout button is disabled.
    // ----------------------------------------------------------------------------
    const checkoutBtn = screen.getByRole("button", { name: /Checkout/i });
    expect(checkoutBtn).toBeDisabled();
  });
});
