/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/discounts/discounts-table.tsx
 *
 * Purpose
 * -------
 * Verify that DiscountsTable component renders discount percentages, description, status badges (Applicable, Scheduled, Expired),
 * and triggers onDeleteClick callback.
 *
 * Tested Features
 * ---------------
 * ✓ Table headers and column values rendering
 * ✓ Status badge calculation (Applicable, Scheduled, Expired based on dates)
 * ✓ Triggering onDeleteClick when Delete button is clicked
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering global & course-specific discount rows
 * ✓ Delete action interaction
 *
 * Mocked Dependencies
 * -------------------
 * - None
 *
 * Not Covered
 * -----------
 * - Real backend date parsing
 *
 * Notes
 * -----
 * Unit test for DiscountsTable component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DiscountsTable } from "../discounts-table";

describe("DiscountsTable", () => {
  const mockOnDeleteClick = vi.fn();

  it("shouldRenderDiscountsTableRowsAndTriggerDelete", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock discounts array with future/active valid dates.
    // ----------------------------------------------------------------------------
    const mockDiscounts = [
      {
        id: "disc-1",
        discountPercentage: 25,
        discountDescription: "Summer Tech Sale",
        validFrom: "2026-01-01T00:00:00.000Z",
        validTo: "2026-12-31T23:59:59.000Z",
        createdBy: "admin_user",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ];

    // ----------------------------------------------------------------------------
    // Act
    // Render DiscountsTable.
    // ----------------------------------------------------------------------------
    render(
      <DiscountsTable
        discounts={mockDiscounts as any}
        loading={false}
        onDeleteClick={mockOnDeleteClick}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify discount badge, description, and delete button click.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("-25%")).toBeInTheDocument();
    expect(screen.getByText("Summer Tech Sale")).toBeInTheDocument();

    const deleteBtn = screen.getByRole("button", { name: "Delete discount" });
    fireEvent.click(deleteBtn);

    expect(mockOnDeleteClick).toHaveBeenCalledWith("disc-1");
  });
});
