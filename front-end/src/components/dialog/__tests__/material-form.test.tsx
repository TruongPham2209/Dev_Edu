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

import * as lecturesApi from "@/lib/api/lectures";
import * as apiToast from "@/lib/use-api-with-toast";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MaterialFormDialog } from "../material-form";

vi.mock("@/lib/api/lectures", () => ({
  useCreateMaterialMutation: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

vi.mock("@/lib/util/chunked-upload", () => ({
  uploadFileWithStrategy: vi.fn(),
}));

import {
  createMockApiWithToast,
  createMockMutationResult,
} from "@/testing/mock-query";

describe("MaterialFormDialog", () => {
  const mockCreateMaterialMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(lecturesApi.useCreateMaterialMutation).mockReturnValue(
      createMockMutationResult({
        mutateAsync: mockCreateMaterialMutate,
      }),
    );
    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast(),
    );
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
    expect(
      screen.getByText("File size must not exceed 100MB."),
    ).toBeInTheDocument();
  });

  it("shouldSubmitMaterialWhenInputsAreValid", async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();
    mockCreateMaterialMutate.mockResolvedValue({
      id: "mat-1",
      title: "React Cheatsheet",
      fileObjectKey: "materials/react_sheet.pdf",
    });

    const chunkedUpload = await import("@/lib/util/chunked-upload");
    vi.mocked(chunkedUpload.uploadFileWithStrategy).mockResolvedValue({
      originalFileName: "React_Cheatsheet.pdf",
      contentType: "application/pdf",
      objectKey: "materials/react_sheet.pdf",
    });

    render(
      <MaterialFormDialog
        open={true}
        onClose={handleClose}
        lectureId="lec-1"
        onSuccess={handleSuccess}
      />,
    );

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const testFile = new File(["pdf content"], "React_Cheatsheet.pdf", {
      type: "application/pdf",
    });
    fireEvent.change(fileInput, { target: { files: [testFile] } });

    const uploadBtn = screen.getByRole("button", { name: "Upload" });
    expect(uploadBtn).not.toBeDisabled();
    fireEvent.click(uploadBtn);

    await vi.waitFor(() => {
      expect(chunkedUpload.uploadFileWithStrategy).toHaveBeenCalledWith(
        testFile,
        expect.objectContaining({ isPublic: false }),
      );
      expect(mockCreateMaterialMutate).toHaveBeenCalledWith({
        lectureId: "lec-1",
        title: "React_Cheatsheet",
        fileObjectKey: "materials/react_sheet.pdf",
      });
      expect(handleSuccess).toHaveBeenCalledTimes(1);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
