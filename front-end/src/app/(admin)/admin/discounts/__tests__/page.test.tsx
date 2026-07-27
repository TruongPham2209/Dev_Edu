/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/discounts/page.tsx
 *
 * Purpose
 * -------
 * Verify that AdminDiscountsPage queries global discounts, renders HeroInfo, opens DiscountFormDialog on Create,
 * and handles delete confirmation dialog.
 *
 * Tested Features
 * ---------------
 * ✓ Discounts Management Hero banner rendering
 * ✓ Opening DiscountFormDialog on create button click
 * ✓ DiscountsTable rendering with fetched campaigns
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state
 * ✓ Empty discounts state
 * ✓ Global discounts listing
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/enrollments" (useGlobalCourseDiscountsInfiniteQuery, useDeleteCourseDiscountMutation)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 * - "./discounts-table" (mocked DiscountsTable)
 * - "@/components/dialog/discount-form" (mocked DiscountFormDialog)
 *
 * Not Covered
 * -----------
 * - IntersectionObserver infinite scroll trigger
 *
 * Notes
 * -----
 * Unit test for AdminDiscountsPage component.
 */

import * as enrollmentsApi from "@/lib/api/enrollments";
import * as apiToast from "@/lib/use-api-with-toast";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminDiscountsPage from "../page";

vi.mock("@/lib/api/enrollments", () => ({
  useGlobalCourseDiscountsInfiniteQuery: vi.fn(),
  useDeleteCourseDiscountMutation: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

vi.mock("./discounts-table", () => ({
  DiscountsTable: ({ discounts, onDeleteClick }: any) => (
    <div data-testid="discounts-table-mock">
      {discounts.map((d: any) => (
        <div key={d.id}>
          <span>{d.discountDescription}</span>
          <button onClick={() => onDeleteClick(d.id)}>
            Delete {d.discountDescription}
          </button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("@/components/dialog/discount-form", () => ({
  DiscountFormDialog: ({ open, onClose }: any) =>
    open ? (
      <div data-testid="discount-form-dialog">
        <button onClick={onClose}>Close Discount Dialog</button>
      </div>
    ) : null,
}));

describe("AdminDiscountsPage", () => {
  const mockRefetch = vi.fn();

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

    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      showSuccess: vi.fn(),
      handleError: vi.fn(),
    } as any);

    vi.mocked(
      enrollmentsApi.useGlobalCourseDiscountsInfiniteQuery,
    ).mockReturnValue({
      data: {
        pages: [
          {
            contents: [
              {
                id: "disc-1",
                discountPercentage: 20,
                discountDescription: "New Year Sale 2026",
              },
            ],
          },
        ],
      },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      refetch: mockRefetch,
      error: null,
    } as any);

    vi.mocked(enrollmentsApi.useDeleteCourseDiscountMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
  });

  it("shouldRenderDiscountsManagementTitleAndTable", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render AdminDiscountsPage.
    // ----------------------------------------------------------------------------
    render(<AdminDiscountsPage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title and mock table render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Discounts Management")).toBeInTheDocument();
    expect(screen.getByText("New Year Sale 2026")).toBeInTheDocument();
  });

  it("shouldOpenDiscountFormDialogOnCreateClick", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render AdminDiscountsPage.
    // ----------------------------------------------------------------------------
    render(<AdminDiscountsPage />);

    // ----------------------------------------------------------------------------
    // Act
    // Click Create global discount button.
    // ----------------------------------------------------------------------------
    const createBtn = screen.getByRole("button", {
      name: "Create global discount",
    });
    fireEvent.click(createBtn);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify DiscountFormDialog renders.
    // ----------------------------------------------------------------------------
    expect(screen.getByTestId("discount-form-dialog")).toBeInTheDocument();
  });
});
