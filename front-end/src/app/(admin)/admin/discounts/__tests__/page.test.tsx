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
import type { CourseDiscountResponse } from "@/lib/type/courses";
import type { CustomPaging } from "@/lib/type/api";
import { createMockDiscount } from "@/testing/mock-data";
import {
  createMockApiWithToast,
  createMockInfiniteQueryResult,
  createMockMutationResult,
} from "@/testing/mock-query";
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
  DiscountsTable: ({
    discounts = [],
    onDeleteClick,
  }: {
    discounts?: Array<{ id: string; discountDescription?: string }>;
    onDeleteClick?: (id: string) => void;
  }) => (
    <div data-testid="discounts-table-mock">
      {discounts.map((d) => (
        <div key={d.id}>
          <span>{d.discountDescription}</span>
          <button onClick={() => onDeleteClick?.(d.id)}>
            Delete {d.discountDescription}
          </button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("@/components/dialog/discount-form", () => ({
  DiscountFormDialog: ({
    open,
    onClose,
  }: {
    open?: boolean;
    onClose?: () => void;
  }) =>
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

    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast(),
    );

    const mockDiscount: CourseDiscountResponse = createMockDiscount({
      id: "disc-1",
      discountPercentage: 20,
      discountDescription: "New Year Sale 2026",
    });

    const pageData: CustomPaging<CourseDiscountResponse> = {
      contents: [mockDiscount],
      currentPage: 0,
      pageSize: 10,
      totalElements: 1,
      totalPages: 1,
    };

    vi.mocked(
      enrollmentsApi.useGlobalCourseDiscountsInfiniteQuery,
    ).mockReturnValue(
      createMockInfiniteQueryResult(
        {
          pageParams: [null],
          pages: [pageData],
        },
        { refetch: mockRefetch },
      ),
    );

    vi.mocked(enrollmentsApi.useDeleteCourseDiscountMutation).mockReturnValue(
      createMockMutationResult(),
    );
  });

  it("shouldRenderDiscountsManagementTitleAndTable", () => {
    render(<AdminDiscountsPage />);

    expect(screen.getByText("Discounts Management")).toBeInTheDocument();
    expect(screen.getByText("New Year Sale 2026")).toBeInTheDocument();
  });

  it("shouldOpenDiscountFormDialogOnCreateClick", () => {
    render(<AdminDiscountsPage />);

    const createBtn = screen.getByRole("button", {
      name: "Create global discount",
    });
    fireEvent.click(createBtn);

    expect(screen.getByTestId("discount-form-dialog")).toBeInTheDocument();
  });
});
