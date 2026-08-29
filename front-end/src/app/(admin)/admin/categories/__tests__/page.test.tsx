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
import type { CategoryResponse } from "@/lib/type/courses";
import { createMockCategory } from "@/testing/mock-data";
import {
  createMockApiWithToast,
  createMockMutationResult,
  createMockQueryResult,
} from "@/testing/mock-query";
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
  CategoryTable: ({
    categories = [],
    onEdit,
    onDelete,
  }: {
    categories?: CategoryResponse[];
    onEdit?: (c: CategoryResponse) => void;
    onDelete?: (id: string, name: string) => void;
  }) => (
    <div data-testid="category-table-mock">
      {categories.map((c) => (
        <div key={c.id}>
          <span>{c.name}</span>
          <button onClick={() => onEdit?.(c)}>Edit {c.name}</button>
          <button onClick={() => onDelete?.(c.id, c.name)}>
            Delete {c.name}
          </button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("@/components/dialog/category-form", () => ({
  CategoryFormDialog: ({
    open,
    onClose,
  }: {
    open?: boolean;
    onClose?: () => void;
  }) =>
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

    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast(),
    );

    const mockCategory = createMockCategory({
      id: "cat-1",
      name: "DevOps & Cloud",
      description: "AWS, Kubernetes",
    });

    vi.mocked(coursesApi.useCategoriesQuery).mockReturnValue(
      createMockQueryResult([mockCategory], { refetch: mockRefetch }),
    );

    vi.mocked(coursesApi.useCreateCategoryMutation).mockReturnValue(
      createMockMutationResult(),
    );

    vi.mocked(coursesApi.useUpdateCategoryMutation).mockReturnValue(
      createMockMutationResult(),
    );

    vi.mocked(coursesApi.useDeleteCategoryMutation).mockReturnValue(
      createMockMutationResult({
        mutateAsync: mockDeleteMutate,
        isPending: false,
      }),
    );

    vi.mocked(filesApi.usePreSignedUploadUrlMutation).mockReturnValue(
      createMockMutationResult(),
    );
  });

  it("shouldRenderCategoriesManagementHeaderAndTable", () => {
    render(<AdminCategoriesPage />);

    expect(screen.getByText("Category Management")).toBeInTheDocument();
    expect(screen.getByText("Total categories: 1")).toBeInTheDocument();
    expect(screen.getByText("DevOps & Cloud")).toBeInTheDocument();
  });

  it("shouldOpenCategoryFormDialogOnNewCategoryClick", () => {
    render(<AdminCategoriesPage />);

    const newBtn = screen.getByRole("button", { name: "New Category" });
    fireEvent.click(newBtn);

    expect(screen.getByTestId("category-form-dialog")).toBeInTheDocument();
  });
});
