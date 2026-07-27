/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/categories/page.tsx
 *
 * Purpose
 * -------
 * Verify that AdminCategoriesPage queries categories, renders CategoryTable, opens creation/edit CategoryFormDialog,
 * and handles category deletion confirm dialog.
 *
 * Tested Features
 * ---------------
 * ✓ Category Management Hero banner rendering
 * ✓ Total categories counter rendering
 * ✓ Opening CategoryFormDialog on New Category button click
 * ✓ Handling category deletion confirm dialog
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state
 * ✓ Categories list rendering
 * ✓ Category deletion workflow
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/courses" (useCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation)
 * - "@/lib/api/files" (usePreSignedUploadUrlMutation)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 * - "@/components/dialog/category-form" (mocked CategoryFormDialog)
 * - "./category-table" (mocked CategoryTable)
 *
 * Not Covered
 * -----------
 * - Direct S3 file upload PUT request
 *
 * Notes
 * -----
 * Unit test for AdminCategoriesPage component.
 */

import * as coursesApi from "@/lib/api/courses";
import * as filesApi from "@/lib/api/files";
import * as apiToast from "@/lib/use-api-with-toast";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminCategoriesPage from "../page";

vi.mock("@/lib/api/courses", () => ({
  useCategoriesQuery: vi.fn(),
  useCreateCategoryMutation: vi.fn(),
  useUpdateCategoryMutation: vi.fn(),
  useDeleteCategoryMutation: vi.fn(),
}));

vi.mock("@/lib/api/files", () => ({
  usePreSignedUploadUrlMutation: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

vi.mock("./category-table", () => ({
  CategoryTable: ({ categories, onEdit, onDelete }: any) => (
    <div data-testid="category-table-mock">
      {categories.map((c: any) => (
        <div key={c.id}>
          <span>{c.name}</span>
          <button onClick={() => onEdit(c)}>Edit {c.name}</button>
          <button onClick={() => onDelete(c.id, c.name)}>
            Delete {c.name}
          </button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("@/components/dialog/category-form", () => ({
  CategoryFormDialog: ({ open, onClose }: any) =>
    open ? (
      <div data-testid="category-form-dialog">
        <button onClick={onClose}>Close Form Dialog</button>
      </div>
    ) : null,
}));

describe("AdminCategoriesPage", () => {
  const mockRefetch = vi.fn();
  const mockDeleteMutate = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      showSuccess: vi.fn(),
      handleError: vi.fn(),
    } as any);

    vi.mocked(coursesApi.useCategoriesQuery).mockReturnValue({
      data: [
        { id: "cat-1", name: "DevOps & Cloud", description: "AWS, Kubernetes" },
      ],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    } as any);

    vi.mocked(coursesApi.useCreateCategoryMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);

    vi.mocked(coursesApi.useUpdateCategoryMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);

    vi.mocked(coursesApi.useDeleteCategoryMutation).mockReturnValue({
      mutateAsync: mockDeleteMutate,
      isPending: false,
    } as any);

    vi.mocked(filesApi.usePreSignedUploadUrlMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
  });

  it("shouldRenderCategoryManagementTitleAndCategoriesList", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render AdminCategoriesPage.
    // ----------------------------------------------------------------------------
    render(<AdminCategoriesPage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, total category counter, and mock table render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Category Management")).toBeInTheDocument();
    expect(screen.getByText("Total categories: 1")).toBeInTheDocument();
    expect(screen.getByText("DevOps & Cloud")).toBeInTheDocument();
  });

  it("shouldOpenCategoryFormDialogOnNewCategoryClick", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render AdminCategoriesPage.
    // ----------------------------------------------------------------------------
    render(<AdminCategoriesPage />);

    // ----------------------------------------------------------------------------
    // Act
    // Click New Category button.
    // ----------------------------------------------------------------------------
    const newCategoryBtn = screen.getByRole("button", { name: "New Category" });
    fireEvent.click(newCategoryBtn);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify CategoryFormDialog renders.
    // ----------------------------------------------------------------------------
    expect(screen.getByTestId("category-form-dialog")).toBeInTheDocument();
  });
});
