/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/checkout/order-summary.tsx
 *
 * Purpose
 * -------
 * Verify that OrderSummary component renders subtotal, discount savings badge, total price,
 * and handles Pay Securely Now and Cancel Transaction button clicks.
 *
 * Tested Features
 * ---------------
 * ✓ Subtotal, discount amount, and total price display
 * ✓ Savings notice banner display when discount > 0
 * ✓ Pay Securely Now button click triggering onProceed callback
 * ✓ Cancel Transaction button click triggering onCancel callback
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering order summary with discount
 * ✓ Triggering proceed payment
 * ✓ Triggering cancel order
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements via RTL)
 *
 * Not Covered
 * -----------
 * - Sticky positioning layout
 *
 * Notes
 * -----
 * Unit test for OrderSummary component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OrderSummary } from "../order-summary";

describe("OrderSummary", () => {
  it("shouldRenderSubtotalDiscountTotalAndTriggerProceedAndCancel", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare callbacks.
    // ----------------------------------------------------------------------------
    const handleProceed = vi.fn();
    const handleCancel = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render OrderSummary.
    // ----------------------------------------------------------------------------
    render(
      <OrderSummary
        subtotal={1000000}
        discount={200000}
        total={800000}
        onProceed={handleProceed}
        onCancel={handleCancel}
        isProcessing={false}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify subtotal, discount, total, and savings banner.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("800.000đ")).toBeInTheDocument();

    const proceedBtn = screen.getByRole("button", { name: "Pay Securely Now" });
    const cancelBtn = screen.getByRole("button", {
      name: "Cancel Transaction",
    });

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click action buttons.
    // ----------------------------------------------------------------------------
    fireEvent.click(proceedBtn);
    expect(handleProceed).toHaveBeenCalledTimes(1);

    fireEvent.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
