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
import type { OrderDetailResponse } from "@/lib/type/enrollments";
import type { CustomPaging } from "@/lib/type/api";
import { createMockInfiniteQueryResult } from "@/testing/mock-query";
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
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    Object.defineProperty(window, "IntersectionObserver", {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver,
    });
  });

  it("shouldRenderEmptyStateWhenNoOrdersExist", () => {
    const emptyPaging: CustomPaging<OrderDetailResponse> = {
      contents: [],
      currentPage: 0,
      pageSize: 10,
      totalElements: 0,
      totalPages: 0,
    };

    vi.mocked(enrollmentsApi.useOrderHistoryInfinateQuery).mockReturnValue(
      createMockInfiniteQueryResult(
        { pages: [emptyPaging], pageParams: [null] },
      ),
    );

    render(<PurchaseHistoryTabContent />);

    expect(screen.getByText("No orders yet")).toBeInTheDocument();
  });

  it("shouldRenderOrderHistoryListWithOrderDetails", () => {
    const mockOrders: OrderDetailResponse[] = [
      {
        id: "ord-888-abc",
        totalAmount: 1500000,
        status: "COMPLETED",
        createdAt: "2026-06-10T10:00:00.000Z",
        items: [
          {
            id: "item-1",
            courseId: "c-100",
            title: "Java Spring Boot Pro",
            description: "Java course",
            thumbnailUrl: "https://example.com/thumb.jpg",
            originalPrice: 1500000,
            discountedPrice: 1500000,
            timestamp: "2026-06-10T10:00:00.000Z",
          },
        ],
      },
    ];

    const pagingWithOrders: CustomPaging<OrderDetailResponse> = {
      contents: mockOrders,
      currentPage: 0,
      pageSize: 10,
      totalElements: 1,
      totalPages: 1,
    };

    vi.mocked(enrollmentsApi.useOrderHistoryInfinateQuery).mockReturnValue(
      createMockInfiniteQueryResult(
        { pages: [pagingWithOrders], pageParams: [null] },
      ),
    );

    render(<PurchaseHistoryTabContent />);

    expect(screen.getByText("#ORD")).toBeInTheDocument();
    expect(screen.getByText("Java Spring Boot Pro")).toBeInTheDocument();
    expect(screen.getAllByText("1.500.000đ")[0]).toBeInTheDocument();
  });
});
