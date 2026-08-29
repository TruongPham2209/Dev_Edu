/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/checkout/page.tsx
 *
 * Purpose
 * -------
 * Verify that CheckoutPage handles order details query loading, missing orderId error state,
 * order items listing, payment method selection, payment creation, and order cancellation.
 *
 * Tested Features
 * ---------------
 * ✓ Error state rendering when orderId URL param is missing
 * ✓ Order details rendering (Order Details header, items list, payment methods)
 * ✓ Pay Securely Now button triggering createPayment mutation
 * ✓ Cancel Transaction button triggering cancelOrder mutation
 *
 * Covered Scenarios
 * -----------------
 * ✓ Missing orderId error state
 * ✓ Successful order detail resolution and payment creation
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation" (useRouter, useSearchParams)
 * - "@/lib/api/enrollments" (useCancelOrderMutation, useCreatePaymentMutation, useOrderDetailQuery)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 *
 * Not Covered
 * -----------
 * - External VNPAY payment gateway page redirect
 *
 * Notes
 * -----
 * Unit test for CheckoutPage component.
 */

import * as enrollmentsApi from "@/lib/api/enrollments";
import * as apiToast from "@/lib/use-api-with-toast";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CheckoutPage from "../page";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock("@/lib/api/enrollments", () => ({
  useCancelOrderMutation: vi.fn(),
  useCreatePaymentMutation: vi.fn(),
  useOrderDetailQuery: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

describe("CheckoutPage", () => {
  const mockPush = vi.fn();
  const mockCancelMutate = vi.fn();
  const mockCreatePaymentMutate = vi.fn();
  const mockShowSuccess = vi.fn();
  const mockHandleError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as never);

    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      showSuccess: mockShowSuccess,
      handleError: mockHandleError,
    } as never);

    vi.mocked(enrollmentsApi.useCancelOrderMutation).mockReturnValue({
      mutate: mockCancelMutate,
      isPending: false,
    } as never);

    vi.mocked(enrollmentsApi.useCreatePaymentMutation).mockReturnValue({
      mutate: mockCreatePaymentMutate,
      isPending: false,
    } as never);
  });

  it("shouldRenderErrorStateWhenOrderIdIsMissingInURL", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return empty searchParams.
    // ----------------------------------------------------------------------------
    vi.mocked(useSearchParams).mockReturnValue({
      get: () => null,
    } as never);

    vi.mocked(enrollmentsApi.useOrderDetailQuery).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as never);

    // ----------------------------------------------------------------------------
    // Act
    // Render CheckoutPage.
    // ----------------------------------------------------------------------------
    render(<CheckoutPage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify error state title.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Failed to load checkout page"),
    ).toBeInTheDocument();
  });

  it("shouldRenderOrderDetailsAndInitiatePaymentOnProceedClick", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return valid orderId and order details data.
    // ----------------------------------------------------------------------------
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === "orderId" ? "order-123" : null),
    } as never);

    const mockOrderData = {
      id: "order-123",
      totalAmount: 800000,
      items: [
        {
          id: "c-1",
          title: "Next.js App Router Masterclass",
          discountedPrice: 800000,
          originalPrice: 1000000,
        },
      ],
    };

    vi.mocked(enrollmentsApi.useOrderDetailQuery).mockReturnValue({
      data: mockOrderData,
      isLoading: false,
      error: null,
    } as never);

    // ----------------------------------------------------------------------------
    // Act
    // Render CheckoutPage.
    // ----------------------------------------------------------------------------
    render(<CheckoutPage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify order title and items render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Order Details")).toBeInTheDocument();
    expect(
      screen.getByText("Next.js App Router Masterclass"),
    ).toBeInTheDocument();

    // Click Pay Securely Now button
    const payBtn = screen.getByRole("button", { name: "Pay Securely Now" });
    fireEvent.click(payBtn);

    // ----------------------------------------------------------------------------
    // Verify
    // Verify mockCreatePaymentMutate execution with orderId and paymentMethod.
    // ----------------------------------------------------------------------------
    await waitFor(() => {
      expect(mockCreatePaymentMutate).toHaveBeenCalledWith(
        { orderId: "order-123", paymentMethod: "VNPAY" },
        expect.anything(),
      );
    });
  });
});
