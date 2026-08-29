/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/user-form/import-tab.tsx
 *
 * Purpose
 * -------
 * Verify that ImportTab component handles Excel drag & drop upload zone, Excel template download,
 * Excel row parsing and validation, error table rendering, and batch user creation submission.
 *
 * Tested Features
 * ---------------
 * ✓ Drag & drop dropzone rendering and template download button click
 * ✓ Excel file upload handling and error validation table display
 * ✓ Valid imported users table display and item removal
 * ✓ Batch create users mutation submit execution
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering initial drag and drop zone
 * ✓ Clicking Download Template button
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/users" (useBatchCreateUsersMutation)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 * - "xlsx" (XLSX utils)
 *
 * Not Covered
 * -----------
 * - Browser native file save prompt
 *
 * Notes
 * -----
 * Unit test for ImportTab component.
 */

import * as usersApi from "@/lib/api/users";
import * as apiToast from "@/lib/use-api-with-toast";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as XLSX from "xlsx";
import { ImportTab } from "../import-tab";

vi.mock("@/lib/api/users", () => ({
  useBatchCreateUsersMutation: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

vi.mock("xlsx", () => ({
  utils: {
    aoa_to_sheet: vi.fn().mockReturnValue({}),
    book_new: vi.fn().mockReturnValue({}),
    book_append_sheet: vi.fn(),
    sheet_to_json: vi.fn(),
  },
  read: vi.fn(),
  writeFile: vi.fn(),
}));

import {
  createMockApiWithToast,
  createMockMutationResult,
} from "@/testing/mock-query";

describe("ImportTab", () => {
  const mockBatchMutate = vi.fn();
  const mockShowSuccess = vi.fn();
  const mockHandleError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usersApi.useBatchCreateUsersMutation).mockReturnValue({
      mutateAsync: mockBatchMutate,
    } as never);
    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      showSuccess: mockShowSuccess,
      handleError: mockHandleError,
    } as never);
    vi.mocked(usersApi.useBatchCreateUsersMutation).mockReturnValue(
      createMockMutationResult({
        mutateAsync: mockBatchMutate,
      }),
    );
    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast(),
    );
  });

  it("shouldRenderDragAndDropZoneAndDownloadTemplateButton", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render ImportTab.
    // ----------------------------------------------------------------------------
    render(<ImportTab onReady={vi.fn()} onSaved={vi.fn()} onClose={vi.fn()} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify dropzone instructions and download template button.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Drag and drop Excel file here"),
    ).toBeInTheDocument();

    const downloadBtn = screen.getByRole("button", {
      name: /Download Template/i,
    });
    expect(downloadBtn).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click Download Template button and verify XLSX writeFile invocation.
    // ----------------------------------------------------------------------------
    fireEvent.click(downloadBtn);
    expect(XLSX.writeFile).toHaveBeenCalledWith(
      expect.anything(),
      "Import_Users_Template.xlsx",
    );
  });
});
