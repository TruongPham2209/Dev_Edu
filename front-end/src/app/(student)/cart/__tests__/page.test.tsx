/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/cart/page.tsx
 *
 * Purpose
 * -------
 * Verify that CartPage renders header title ("Purchases & Cart"), animated tabs
 * ("Cart", "Order History"), and switches between tab contents.
 *
 * Tested Features
 * ---------------
 * ✓ Title rendering ("Purchases & Cart")
 * ✓ Tab options rendering ("Cart", "Order History")
 * ✓ Tab selection state switching
 *
 * Covered Scenarios
 * -----------------
 * ✓ CartPage rendering
 * ✓ Switching tabs to Order History
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation" (useRouter)
 * - "@/lib/api/enrollments" (useCartItemsInfiniteQuery, useOrderHistoryInfinateQuery, useEnrollmentsInfiniteQuery)
 *
 * Not Covered
 * -----------
 * - Backdrop filter styling
 *
 * Notes
 * -----
 * Unit test for CartPage component.
 */

import * as enrollmentsApi from "@/lib/api/enrollments";
import { fireEvent, render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CartPage from "../page";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: () => ({
    handleError: vi.fn(),
    showSuccess: vi.fn(),
  }),
}));

vi.mock("../review-dialog", () => ({
  ReviewDialog: () => null,
}));

vi.mock("@/lib/api/enrollments", () => ({
  useCartItemsInfiniteQuery: vi.fn(),
  useOrderHistoryInfinateQuery: vi.fn(),
  useEnrollmentsInfiniteQuery: vi.fn(),
  useCheckoutMutation: () => ({ mutateAsync: vi.fn() }),
  useRemoveFromCartMutation: () => ({ mutateAsync: vi.fn() }),
}));

describe("CartPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as any);

    vi.mocked(enrollmentsApi.useCartItemsInfiniteQuery).mockReturnValue({
      data: { pages: [{ contents: [] }] },
      isLoading: false,
    } as any);

    vi.mocked(enrollmentsApi.useOrderHistoryInfinateQuery).mockReturnValue({
      data: { pages: [{ contents: [] }] },
      isLoading: false,
    } as any);

    vi.mocked(enrollmentsApi.useEnrollmentsInfiniteQuery).mockReturnValue({
      data: { pages: [{ contents: [] }] },
      isLoading: false,
    } as any);

    class MockIntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    window.IntersectionObserver = MockIntersectionObserver as any;
  });

  it("shouldRenderTitleAndTabsAndSwitchBetweenTabContents", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render CartPage.
    // ----------------------------------------------------------------------------
    render(<CartPage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title and tab options render.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByRole("heading", { name: "Purchases & Cart" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Cart")).toBeInTheDocument();
    expect(screen.getByText("Order History")).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click Order History tab.
    // ----------------------------------------------------------------------------
    const orderTab = screen.getByText("Order History");
    fireEvent.click(orderTab);

    expect(screen.getByText("No orders yet")).toBeInTheDocument();
  });
});
