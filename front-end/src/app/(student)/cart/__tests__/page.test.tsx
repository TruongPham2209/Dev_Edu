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

import type {
  CourseItemDetailResponse,
  OrderDetailResponse,
} from "@/lib/type/enrollments";
import * as enrollmentsApi from "@/lib/api/enrollments";
import { createMockCustomPaging, createMockRouter } from "@/testing/mock-data";
import { createMockInfiniteQueryResult } from "@/testing/mock-query";
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
    vi.mocked(useRouter).mockReturnValue(createMockRouter());

    vi.mocked(enrollmentsApi.useCartItemsInfiniteQuery).mockReturnValue(
      createMockInfiniteQueryResult({
        pages: [createMockCustomPaging<CourseItemDetailResponse>([])],
        pageParams: [null],
      }),
    );

    vi.mocked(enrollmentsApi.useOrderHistoryInfinateQuery).mockReturnValue(
      createMockInfiniteQueryResult({
        pages: [createMockCustomPaging<OrderDetailResponse>([])],
        pageParams: [null],
      }),
    );

    vi.mocked(enrollmentsApi.useEnrollmentsInfiniteQuery).mockReturnValue(
      createMockInfiniteQueryResult({
        pages: [createMockCustomPaging<CourseItemDetailResponse>([])],
        pageParams: [null],
      }),
    );

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
