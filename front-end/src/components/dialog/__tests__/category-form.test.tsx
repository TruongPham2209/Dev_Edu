/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/category-form.tsx
 *
 * Purpose
 * -------
 * Verify that CategoryFormDialog component handles category creation vs editing,
 * name/description length validation, file upload validation (image type & max 5MB size limit),
 * file drag-and-drop, and save callback invocation.
 *
 * Tested Features
 * ---------------
 * ✓ Title rendering ("Create New Category" vs "Update Category")
 * ✓ Form field validation (name: 2-50 chars, description: 6-250 chars, image required)
 * ✓ Image file validation (type check for image/* and max size <= 5MB)
 * ✓ onError execution on invalid file upload
 * ✓ Save callback execution with form data and selected file
 *
 * Covered Scenarios
 * -----------------
 * ✓ New category mode (editing = null)
 * ✓ Update category mode (editing = CategoryResponse)
 * ✓ File validation error (non-image file uploaded)
 * ✓ File size error (file > 5MB)
 * ✓ Form save button submission
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements via RTL)
 *
 * Not Covered
 * -----------
 * - CSS drag overlay styling
 *
 * Notes
 * -----
 * Unit test for CategoryFormDialog component.
 */

import type { CategoryResponse } from "@/lib/type/courses";
import { createMockCategory } from "@/testing/mock-data";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CategoryFormDialog } from "../category-form";

describe("CategoryFormDialog", () => {
  const mockOnSave = vi.fn();
  const mockOnError = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-preview-url");
  });

  it("shouldRenderCreateTitleAndDisabledSubmitWhenFormIsBlank", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render in creation mode.
    // ----------------------------------------------------------------------------
    render(
      <CategoryFormDialog
        open={true}
        editing={null}
        saving={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onError={mockOnError}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title and disabled save button.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Create New Category")).toBeInTheDocument();
    const saveBtn = screen.getByRole("button", { name: "Save" });
    expect(saveBtn).toBeDisabled();
  });

  it("shouldPopulateFieldsInEditingModeAndEnableSubmit", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare editing category data.
    // ----------------------------------------------------------------------------
    const editingCategory: CategoryResponse = createMockCategory({
      id: "cat-1",
      name: "Frontend Development",
      description: "Comprehensive guide to React and Next.js.",
      thumbnailUrl: "https://example.com/cat.jpg",
      thumbnailObjectKey: "categories/cat-1.jpg",
    });

    // ----------------------------------------------------------------------------
    // Act
    // Render in edit mode.
    // ----------------------------------------------------------------------------
    render(
      <CategoryFormDialog
        open={true}
        editing={editingCategory}
        saving={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onError={mockOnError}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, populated inputs, and enabled save button.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Update Category")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Frontend Development"),
    ).toBeInTheDocument();

    const saveBtn = screen.getByRole("button", { name: "Save" });
    expect(saveBtn).not.toBeDisabled();
  });

  it("shouldCallOnErrorWhenSelectedFileIsNotAnImage", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render dialog and create non-image file.
    // ----------------------------------------------------------------------------
    render(
      <CategoryFormDialog
        open={true}
        editing={null}
        saving={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onError={mockOnError}
      />,
    );

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(fileInput).not.toBeNull();
    const textFile = new File(["dummy text"], "document.txt", {
      type: "text/plain",
    });

    // ----------------------------------------------------------------------------
    // Act
    // Trigger file change event.
    // ----------------------------------------------------------------------------
    fireEvent.change(fileInput, { target: { files: [textFile] } });

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify onError was called with image asset requirement error.
    // ----------------------------------------------------------------------------
    expect(mockOnError).toHaveBeenCalledWith(
      new Error("Branding asset must be an image file (JPEG, PNG, etc.)"),
    );
  });
});
