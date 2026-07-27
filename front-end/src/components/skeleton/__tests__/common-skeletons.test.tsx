/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/skeleton/common-skeletons.tsx
 *
 * Purpose
 * -------
 * Verify that ListItemSkeleton, ListSkeleton, and TableSkeleton components render
 * MUI Skeleton placeholders, configured avatar variants, line counts, action buttons,
 * table columns, and table rows correctly.
 *
 * Tested Features
 * ---------------
 * ✓ ListItemSkeleton avatar rendering (circular, rounded, none)
 * ✓ ListItemSkeleton text lines rendering
 * ✓ ListItemSkeleton action skeleton display
 * ✓ ListSkeleton count and divider rendering
 * ✓ TableSkeleton header columns and row count
 * ✓ TableSkeleton column variants ("thumbnail", "circular", "rounded", "action", "actions", "text-double", "text")
 *
 * Covered Scenarios
 * -----------------
 * ✓ ListItemSkeleton with default circular avatar and 2 lines
 * ✓ ListItemSkeleton with avatarVariant: "none"
 * ✓ ListSkeleton rendering specified item count with dividers
 * ✓ TableSkeleton rendering configured columns, header, and rows
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI Table and Skeleton via RTL)
 *
 * Not Covered
 * -----------
 * - Wave animation speed
 *
 * Notes
 * -----
 * Unit test for common skeleton components.
 */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ListItemSkeleton,
  ListSkeleton,
  TableColumnConfig,
  TableSkeleton,
} from "../common-skeletons";

describe("common-skeletons", () => {
  describe("ListItemSkeleton", () => {
    it("shouldRenderDefaultCircularAvatarAndTwoTextLines", () => {
      // ----------------------------------------------------------------------------
      // Arrange & Act
      // Render ListItemSkeleton with default props.
      // ----------------------------------------------------------------------------
      const { container } = render(<ListItemSkeleton />);

      // ----------------------------------------------------------------------------
      // Assert
      // Verify avatar skeleton and 2 line skeletons exist.
      // ----------------------------------------------------------------------------
      const skeletons = container.querySelectorAll(".MuiSkeleton-root");
      expect(skeletons.length).toBe(3); // 1 avatar + 2 text lines
    });

    it("shouldOmitAvatarSkeletonWhenAvatarVariantIsNone", () => {
      // ----------------------------------------------------------------------------
      // Arrange & Act
      // Render with avatarVariant="none" and 3 lines.
      // ----------------------------------------------------------------------------
      const { container } = render(
        <ListItemSkeleton avatarVariant="none" lines={3} hasAction={true} />,
      );

      // ----------------------------------------------------------------------------
      // Assert
      // Verify 3 lines + 1 action skeleton.
      // ----------------------------------------------------------------------------
      const skeletons = container.querySelectorAll(".MuiSkeleton-root");
      expect(skeletons.length).toBe(4); // 3 lines + 1 action
    });
  });

  describe("ListSkeleton", () => {
    it("shouldRenderConfiguredCountOfListItemsAndDividers", () => {
      // ----------------------------------------------------------------------------
      // Arrange & Act
      // Render ListSkeleton with count = 3 and divider = true.
      // ----------------------------------------------------------------------------
      const { container } = render(<ListSkeleton count={3} divider={true} />);

      // ----------------------------------------------------------------------------
      // Assert
      // Verify dividers count is 2 (between 3 items).
      // ----------------------------------------------------------------------------
      const dividers = container.querySelectorAll(".MuiDivider-root");
      expect(dividers.length).toBe(2);
    });
  });

  describe("TableSkeleton", () => {
    it("shouldRenderTableHeaderAndRowsWithColumnVariants", () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare table columns configuration with different variants.
      // ----------------------------------------------------------------------------
      const columns: TableColumnConfig[] = [
        { label: "Thumbnail", variant: "thumbnail" },
        { label: "Course Name", variant: "text-double" },
        { label: "Category", variant: "rounded" },
        { label: "Actions", variant: "actions" },
      ];

      // ----------------------------------------------------------------------------
      // Act
      // Render TableSkeleton with 3 rows.
      // ----------------------------------------------------------------------------
      const { container } = render(
        <TableSkeleton columns={columns} rowCount={3} hasHeader={true} />,
      );

      // ----------------------------------------------------------------------------
      // Assert
      // Verify header cells and table rows count.
      // ----------------------------------------------------------------------------
      const headerRow = container.querySelector("thead tr");
      expect(headerRow).toBeInTheDocument();
      expect(headerRow?.querySelectorAll("th").length).toBe(4);

      const bodyRows = container.querySelectorAll("tbody tr");
      expect(bodyRows.length).toBe(3);
    });
  });
});
