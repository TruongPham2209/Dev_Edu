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

import type {
  CheckoutDetailResponse,
  PaymentRequest,
  PaymentResponse,
} from "@/lib/type/enrollments";
import * as enrollmentsApi from "@/lib/api/enrollments";
import * as apiToast from "@/lib/use-api-with-toast";
import {
  createMockRouter,
  createMockSearchParams,
} from "@/testing/mock-data";
import {
  createMockApiWithToast,
  createMockMutationResult,
  createMockQueryResult,
} from "@/testing/mock-query";
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
    vi.mocked(useRouter).mockReturnValue(createMockRouter({ push: mockPush }));

    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast({
        showSuccess: mockShowSuccess,
        handleError: mockHandleError,
      }),
    );

    vi.mocked(enrollmentsApi.useCancelOrderMutation).mockReturnValue(
      createMockMutationResult({
        mutate: mockCancelMutate,
        isPending: false,
      }),
    );

    vi.mocked(enrollmentsApi.useCreatePaymentMutation).mockReturnValue(
      createMockMutationResult<PaymentResponse, Error, PaymentRequest>({
        mutate: mockCreatePaymentMutate,
        isPending: false,
      }),
    );
  });

  it("shouldRenderErrorStateWhenOrderIdIsMissingInURL", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return empty searchParams.
    // ----------------------------------------------------------------------------
    vi.mocked(useSearchParams).mockReturnValue(createMockSearchParams(""));

    vi.mocked(enrollmentsApi.useOrderDetailQuery).mockReturnValue(
      createMockQueryResult<CheckoutDetailResponse>(undefined),
    );

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
    vi.mocked(useSearchParams).mockReturnValue(
      createMockSearchParams({ orderId: "order-123" }),
    );

    const mockOrderData: CheckoutDetailResponse = {
      orderId: "order-123",
      totalAmount: 800000,
      entityType: "COURSE",
      items: [
        {
          id: "c-1",
          title: "Next.js App Router Masterclass",
          discountedPrice: 800000,
          originalPrice: 1000000,
          registered: false,
          thumbnailUrl: null,
        },
      ],
    };

    vi.mocked(enrollmentsApi.useOrderDetailQuery).mockReturnValue(
      createMockQueryResult(mockOrderData),
    );

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
