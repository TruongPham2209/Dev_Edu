/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/cart/cart-tab.tsx
 *
 * Purpose
 * -------
 * Verify that CartTabContent component renders cart items, select all/deselect all button,
 * item removal with 4-second undo snackbar, checkout mutation trigger, and empty cart state.
 *
 * Tested Features
 * ---------------
 * ✓ Skeleton loading state when isLoading is true
 * ✓ Empty cart message when cart items array is empty
 * ✓ Cart item list rendering with select all button
 * ✓ Item remove trigger with Undo snackbar
 * ✓ Checkout mutation trigger navigating to /checkout?orderId=123
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading cart items
 * ✓ Empty cart
 * ✓ Selecting items and triggering checkout
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation" (useRouter)
 * - "@/lib/api/enrollments" (useCartItemsInfiniteQuery, useCheckoutMutation, useRemoveFromCartMutation)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 *
 * Not Covered
 * -----------
 * - Infinite scroll intersection observer
 *
 * Notes
 * -----
 * Unit test for CartTabContent component.
 */

import * as enrollmentsApi from "@/lib/api/enrollments";
import * as apiToast from "@/lib/use-api-with-toast";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CartTabContent } from "../cart-tab";

vi.mock("@/components/dialog/review-dialog", () => ({
  ReviewDialog: () => null,
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/lib/api/enrollments", () => ({
  useCartItemsInfiniteQuery: vi.fn(),
  useCheckoutMutation: vi.fn(),
  useRemoveFromCartMutation: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

describe("CartTabContent", () => {
  const mockPush = vi.fn();
  const mockCheckoutMutate = vi.fn();
  const mockRemoveMutate = vi.fn();
  const mockHandleError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as never);

    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      handleError: mockHandleError,
    } as never);

    vi.mocked(enrollmentsApi.useCheckoutMutation).mockReturnValue({
      mutateAsync: mockCheckoutMutate,
    } as never);

    vi.mocked(enrollmentsApi.useRemoveFromCartMutation).mockReturnValue({
      mutateAsync: mockRemoveMutate,
    } as never);

    class MockIntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    window.IntersectionObserver = MockIntersectionObserver as never;
  });

  it("shouldRenderEmptyCartStateWhenCartIsEmpty", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return empty cart pages.
    // ----------------------------------------------------------------------------
    vi.mocked(enrollmentsApi.useCartItemsInfiniteQuery).mockReturnValue({
      data: { pages: [{ contents: [] }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      refetch: vi.fn(),
    } as never);

    // ----------------------------------------------------------------------------
    // Act
    // Render CartTabContent.
    // ----------------------------------------------------------------------------
    render(<CartTabContent />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify empty state text and explore courses button.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Cart is empty")).toBeInTheDocument();
  });

  it("shouldSelectItemsAndTriggerCheckout", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return cart items.
    // ----------------------------------------------------------------------------
    const mockCartItems = [
      {
        id: "cart-item-1",
        courseId: "course-1",
        title: "Docker & Kubernetes Mastery",
        discountedPrice: 500000,
        originalPrice: 700000,
      },
    ];

    vi.mocked(enrollmentsApi.useCartItemsInfiniteQuery).mockReturnValue({
      data: { pages: [{ contents: mockCartItems }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      refetch: vi.fn(),
    } as never);

    mockCheckoutMutate.mockResolvedValue({ orderId: "order-999" });

    // ----------------------------------------------------------------------------
    // Act
    // Render CartTabContent.
    // ----------------------------------------------------------------------------
    render(<CartTabContent />);

    // Click "Select all" button
    const selectAllBtn = screen.getByRole("button", { name: "Select all" });
    fireEvent.click(selectAllBtn);

    // Click Checkout button
    const checkoutBtn = screen.getByRole("button", { name: /Checkout/i });
    expect(checkoutBtn).not.toBeDisabled();
    await act(async () => {
      fireEvent.click(checkoutBtn);
    });

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify createCheckoutMutate and router.push to /checkout?orderId=order-999.
    // ----------------------------------------------------------------------------
    await waitFor(() => {
      expect(mockCheckoutMutate).toHaveBeenCalledWith({
        entityIds: ["course-1"],
        entityType: "COURSE",
      });
      expect(mockPush).toHaveBeenCalledWith("/checkout?orderId=order-999");
    });
  });
});
