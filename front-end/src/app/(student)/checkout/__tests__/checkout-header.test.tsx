/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/checkout/checkout-header.tsx
 *
 * Purpose
 * -------
 * Verify that CheckoutHeader component renders Back to Cart button, Secure Checkout badge,
 * and triggers onBack callback.
 *
 * Tested Features
 * ---------------
 * ✓ Back to Cart button rendering and click handler
 * ✓ Secure Checkout badge display
 *
 * Covered Scenarios
 * -----------------
 * ✓ User clicking Back to Cart button
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements via RTL)
 *
 * Not Covered
 * -----------
 * - Theme breakpoints
 *
 * Notes
 * -----
 * Unit test for CheckoutHeader component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CheckoutHeader } from "../checkout-header";

describe("CheckoutHeader", () => {
  it("shouldRenderBackToCartButtonAndTriggerOnBack", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare onBack handler.
    // ----------------------------------------------------------------------------
    const handleBack = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render CheckoutHeader.
    // ----------------------------------------------------------------------------
    render(<CheckoutHeader onBack={handleBack} disabled={false} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify Back to Cart button and Secure Checkout chip render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Secure Checkout")).toBeInTheDocument();

    const backBtn = screen.getByRole("button", { name: /Back to Cart/i });
    fireEvent.click(backBtn);

    expect(handleBack).toHaveBeenCalledTimes(1);
  });
});
