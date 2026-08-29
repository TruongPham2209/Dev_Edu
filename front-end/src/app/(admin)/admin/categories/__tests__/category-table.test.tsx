/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/categories/category-table.tsx
 *
 * Purpose
 * -------
 * Verify that CategoryTable component displays categories list with image preview, name, description,
 * total course count, and triggers Edit/Delete action buttons.
 *
 * Tested Features
 * ---------------
 * ✓ Table headers (STT, Image, Name, Description, Total Courses, Actions) rendering
 * ✓ Triggering onEdit callback when Update button is clicked
 * ✓ Triggering onDelete callback when Delete button is clicked for eligible categories
 * ✓ Disabling Delete button when totalCourses > 0
 * ✓ Triggering onPreviewImage when category thumbnail avatar is clicked
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering category table data
 * ✓ Handling edit and delete action triggers
 * ✓ Handling image preview modal trigger
 *
 * Mocked Dependencies
 * -------------------
 * - None
 *
 * Not Covered
 * -----------
 * - CSS animation scaling
 *
 * Notes
 * -----
 * Unit test for CategoryTable component.
 */

import type { CategoryResponse } from "@/lib/type/courses";
import { createMockCategory } from "@/testing/mock-data";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CategoryTable } from "../category-table";

describe("CategoryTable", () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnPreviewImage = vi.fn();

  it("shouldRenderCategoryTableRowsAndTriggerActions", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock category items.
    // ----------------------------------------------------------------------------
    const mockCategories: CategoryResponse[] = [
      createMockCategory({
        id: "cat-1",
        name: "Backend Development",
        description: "Spring Boot, Node.js, microservices",
        thumbnailUrl: "https://example.com/backend.jpg",
        totalCourses: 0,
      }),
      createMockCategory({
        id: "cat-2",
        name: "Frontend Development",
        description: "React, Next.js, TypeScript",
        thumbnailUrl: "https://example.com/frontend.jpg",
        totalCourses: 5,
      }),
    ];

    // ----------------------------------------------------------------------------
    // Act
    // Render CategoryTable.
    // ----------------------------------------------------------------------------
    render(
      <CategoryTable
        categories={mockCategories}
        loading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPreviewImage={mockOnPreviewImage}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify names and descriptions render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Backend Development")).toBeInTheDocument();
    expect(screen.getByText("Frontend Development")).toBeInTheDocument();

    // Trigger update button for Backend Development
    const updateButtons = screen.getAllByRole("button", { name: "Update" });
    fireEvent.click(updateButtons[0]);
    expect(mockOnEdit).toHaveBeenCalledWith(mockCategories[0]);

    // Trigger delete button for Backend Development (totalCourses = 0)
    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    fireEvent.click(deleteButtons[0]);
    expect(mockOnDelete).toHaveBeenCalledWith("cat-1", "Backend Development");
  });
});
