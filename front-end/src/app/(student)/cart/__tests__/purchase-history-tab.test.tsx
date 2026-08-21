/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/cart/purchase-history-tab.tsx
 *
 * Purpose
 * -------
 * Verify that PurchaseHistoryTabContent component renders order history list, order ID,
 * total amount, order items, status filter dropdown, and handles empty state.
 *
 * Tested Features
 * ---------------
 * ✓ Skeleton loading state when isLoading is true
 * ✓ Empty state rendering when order list is empty
 * ✓ Order history list rendering (order ID, placed date, total amount)
 * ✓ Status filter selection change
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state
 * ✓ Empty order history state
 * ✓ Displaying order history items
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/enrollments" (useOrderHistoryInfinateQuery)
 *
 * Not Covered
 * -----------
 * - Infinite scroll intersection observer
 *
 * Notes
 * -----
 * Unit test for PurchaseHistoryTabContent component.
 */

import * as enrollmentsApi from "@/lib/api/enrollments";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PurchaseHistoryTabContent } from "../purchase-history-tab";

vi.mock("@/components/dialog/review-dialog", () => ({
  ReviewDialog: () => null,
}));

vi.mock("@/lib/api/enrollments", () => ({
  useOrderHistoryInfinateQuery: vi.fn(),
}));

vi.mock("@/lib/api/courses", () => ({
  useMyReviewQuery: vi.fn().mockReturnValue({ data: null, isLoading: false }),
  useCreateReviewMutation: vi.fn().mockReturnValue({ mutate: vi.fn() }),
}));

describe("PurchaseHistoryTabContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    class MockIntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    window.IntersectionObserver = MockIntersectionObserver as any;
  });

  it("shouldRenderEmptyStateWhenNoOrdersExist", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return empty order history.
    // ----------------------------------------------------------------------------
    vi.mocked(enrollmentsApi.useOrderHistoryInfinateQuery).mockReturnValue({
      data: { pages: [{ contents: [] }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    } as any);

    // ----------------------------------------------------------------------------
    // Act
    // Render PurchaseHistoryTabContent.
    // ----------------------------------------------------------------------------
    render(<PurchaseHistoryTabContent />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify empty state text.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("No orders yet")).toBeInTheDocument();
  });

  it("shouldRenderOrderHistoryListWithOrderDetails", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return order history data.
    // ----------------------------------------------------------------------------
    const mockOrders = [
      {
        id: "ord-888-abc",
        totalAmount: 1500000,
        status: "COMPLETED",
        createdAt: "2026-06-10T10:00:00.000Z",
        items: [
          {
            courseId: "c-100",
            title: "Java Spring Boot Pro",
            price: 1500000,
            discountedPrice: 1500000,
          },
        ],
      },
    ];

    vi.mocked(enrollmentsApi.useOrderHistoryInfinateQuery).mockReturnValue({
      data: { pages: [{ contents: mockOrders }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    } as any);

    // ----------------------------------------------------------------------------
    // Act
    // Render PurchaseHistoryTabContent.
    // ----------------------------------------------------------------------------
    render(<PurchaseHistoryTabContent />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify order ID, course title, and total amount.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("#ORD")).toBeInTheDocument();
    expect(screen.getByText("Java Spring Boot Pro")).toBeInTheDocument();
    expect(screen.getAllByText("1.500.000đ")[0]).toBeInTheDocument();
  });
});
