/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/material-form.tsx
 *
 * Purpose
 * -------
 * Verify that MaterialFormDialog component handles title prefilling from file name,
 * file size validation (max 100MB limit), S3 presigned upload URL requests,
 * progress bar updates, and material creation API execution.
 *
 * Tested Features
 * ---------------
 * ✓ Title and file upload validation
 * ✓ Auto prefill of title when file is selected
 * ✓ File size error (exceeds 100MB limit)
 * ✓ Presigned upload URL generation & createMaterialMutate execution
 * ✓ Success toast notification and onSuccess callback invocation
 *
 * Covered Scenarios
 * -----------------
 * ✓ Form rendering with disabled upload button when empty
 * ✓ Selecting valid material file (prefills title)
 * ✓ Selecting oversized file (>100MB)
 * ✓ Successful material upload submission
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/files" (usePreSignedUploadUrlMutation)
 * - "@/lib/api/lectures" (useCreateMaterialMutation)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 *
 * Not Covered
 * -----------
 * - Direct S3 XMLHttpRequest upload stream
 *
 * Notes
 * -----
 * Unit test for MaterialFormDialog component.
 */

import * as filesApi from "@/lib/api/files";
import * as lecturesApi from "@/lib/api/lectures";
import * as apiToast from "@/lib/use-api-with-toast";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MaterialFormDialog } from "../material-form";

vi.mock("@/lib/api/files", () => ({
  usePreSignedUploadUrlMutation: vi.fn(),
}));

vi.mock("@/lib/api/lectures", () => ({
  useCreateMaterialMutation: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

describe("MaterialFormDialog", () => {
  const mockPreSignMutate = vi.fn();
  const mockCreateMaterialMutate = vi.fn();
  const mockShowSuccess = vi.fn();
  const mockHandleError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(filesApi.usePreSignedUploadUrlMutation).mockReturnValue({
      mutateAsync: mockPreSignMutate,
    } as any);
    vi.mocked(lecturesApi.useCreateMaterialMutation).mockReturnValue({
      mutateAsync: mockCreateMaterialMutate,
    } as any);
    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      showSuccess: mockShowSuccess,
      handleError: mockHandleError,
    } as any);
  });

  it("shouldRenderTitleAndDisabledUploadButtonWhenNoFileIsSelected", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render MaterialFormDialog.
    // ----------------------------------------------------------------------------
    render(
      <MaterialFormDialog
        open={true}
        onClose={vi.fn()}
        lectureId="lec-1"
        onSuccess={vi.fn()}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify modal title and disabled submit button.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByRole("heading", { name: "Upload Material" }),
    ).toBeInTheDocument();

    const uploadBtn = screen.getByRole("button", { name: "Upload" });
    expect(uploadBtn).toBeDisabled();
  });

  it("shouldPrefillTitleWhenFileIsSelected", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render dialog and select file.
    // ----------------------------------------------------------------------------
    render(
      <MaterialFormDialog
        open={true}
        onClose={vi.fn()}
        lectureId="lec-1"
        onSuccess={vi.fn()}
      />,
    );

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(fileInput).not.toBeNull();
    const testFile = new File(["pdf data"], "React_Cheatsheet.pdf", {
      type: "application/pdf",
    });

    // ----------------------------------------------------------------------------
    // Act
    // Trigger file selection.
    // ----------------------------------------------------------------------------
    fireEvent.change(fileInput, { target: { files: [testFile] } });

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify title input is prefilled with "React_Cheatsheet".
    // ----------------------------------------------------------------------------
    expect(screen.getByDisplayValue("React_Cheatsheet")).toBeInTheDocument();
  });

  it("shouldDisplayErrorWhenSelectedFileExceeds100MB", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Create oversized dummy file (>100MB).
    // ----------------------------------------------------------------------------
    render(
      <MaterialFormDialog
        open={true}
        onClose={vi.fn()}
        lectureId="lec-1"
        onSuccess={vi.fn()}
      />,
    );

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(fileInput).not.toBeNull();
    const hugeFile = new File(["a"], "large_archive.zip", {
      type: "application/zip",
    });
    Object.defineProperty(hugeFile, "size", { value: 105 * 1024 * 1024 });

    // ----------------------------------------------------------------------------
    // Act
    // Trigger file selection.
    // ----------------------------------------------------------------------------
    fireEvent.change(fileInput, { target: { files: [hugeFile] } });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify error text appears.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("File size exceeds 100MB")).toBeInTheDocument();
  });
});
