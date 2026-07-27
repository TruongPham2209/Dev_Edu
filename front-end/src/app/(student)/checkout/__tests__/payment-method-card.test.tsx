/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/checkout/payment-method-card.tsx
 *
 * Purpose
 * -------
 * Verify that PaymentMethodCard component renders payment method name, description,
 * recommended/coming soon chips, selected state radio, and handles selection click.
 *
 * Tested Features
 * ---------------
 * ✓ Payment method name and description rendering
 * ✓ Recommended chip display when recommended = true
 * ✓ Disabled coming soon chip display when disabled = true
 * ✓ Selection event triggering onSelect callback
 *
 * Covered Scenarios
 * -----------------
 * ✓ Selecting active payment method (VNPAY)
 * ✓ Clicking disabled payment method (MoMo)
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
 * Unit test for PaymentMethodCard component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PaymentMethodCard } from "../payment-method-card";

describe("PaymentMethodCard", () => {
  it("shouldRenderNameDescriptionAndTriggerOnSelectWhenClicked", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare onSelect handler.
    // ----------------------------------------------------------------------------
    const handleSelect = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render active VNPAY payment method.
    // ----------------------------------------------------------------------------
    render(
      <PaymentMethodCard
        method="VNPAY"
        name="VNPAY"
        description="Pay via ATM card or VNPAY-QR"
        selected={true}
        recommended={true}
        onSelect={handleSelect}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify name, description, and Recommended badge.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("VNPAY")).toBeInTheDocument();
    expect(
      screen.getByText("Pay via ATM card or VNPAY-QR"),
    ).toBeInTheDocument();
    expect(screen.getByText("Recommended")).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click card container.
    // ----------------------------------------------------------------------------
    const card = screen.getByText("VNPAY");
    fireEvent.click(card);

    expect(handleSelect).toHaveBeenCalledWith("VNPAY");
  });

  it("shouldNotTriggerOnSelectWhenCardIsDisabled", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare handler.
    // ----------------------------------------------------------------------------
    const handleSelect = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render disabled MOMO payment method.
    // ----------------------------------------------------------------------------
    render(
      <PaymentMethodCard
        method="MOMO"
        name="MoMo"
        description="Pay with MoMo E-Wallet"
        selected={false}
        disabled={true}
        onSelect={handleSelect}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify Coming Soon chip.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();

    // Click disabled card
    const card = screen.getByText("MoMo");
    fireEvent.click(card);

    expect(handleSelect).not.toHaveBeenCalled();
  });
});
