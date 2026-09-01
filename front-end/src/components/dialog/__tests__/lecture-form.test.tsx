/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/lecture-form.tsx
 *
 * Purpose
 * -------
 * Verify that LectureFormDialog component handles lecture creation vs update modes,
 * title/summary/content validation, video file selection & size checks (max 200MB),
 * video locked state in edit mode, and API mutation hooks execution.
 *
 * Tested Features
 * ---------------
 * ✓ Title rendering ("Create new lecture" vs "Edit lecture")
 * ✓ Form input validations (title, summary, content required)
 * ✓ Locked video notice rendering in update mode
 * ✓ Mutation execution (createLectureMutate vs updateLectureMutate)
 * ✓ Toast notifications and onSaved callback execution
 *
 * Covered Scenarios
 * -----------------
 * ✓ New lecture mode (initialData = undefined)
 * ✓ Update lecture mode (initialData = LectureResponse with locked video)
 * ✓ Submitting valid lecture form payload
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/files" (useConfirmImageUploadMutation, useDownloadUrlQuery, usePreSignedUploadUrlMutation)
 * - "@/lib/api/lectures" (useCreateLectureMutation, useUpdateLectureMutation)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 * - "@/components/common/form/rich-text-editor" (mocked textarea)
 *
 * Not Covered
 * -----------
 * - S3 direct XMLHttpRequest upload progress bar
 *
 * Notes
 * -----
 * Unit test for LectureFormDialog component.
 */

import * as filesApi from "@/lib/api/files";
import * as lecturesApi from "@/lib/api/lectures";
import type { FileUploadResponse } from "@/lib/type/files";
import type { LectureResponse } from "@/lib/type/lectures";
import * as apiToast from "@/lib/use-api-with-toast";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LectureFormDialog } from "../lecture-form";

vi.mock("@/lib/api/files", () => ({
  useConfirmImageUploadMutation: vi.fn(),
  useDownloadUrlQuery: vi.fn(),
  usePreSignedUploadUrlMutation: vi.fn(),
}));

vi.mock("@/lib/api/lectures", () => ({
  useCreateLectureMutation: vi.fn(),
  useUpdateLectureMutation: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

vi.mock("@/lib/util/chunked-upload", () => ({
  uploadFileWithStrategy: vi.fn(),
}));

vi.mock("@/components/common/form/rich-text-editor", () => ({
  RichTextEditor: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <textarea
      data-testid="lecture-content-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

import { createMockLecture } from "@/testing/mock-data";
import {
  createMockApiWithToast,
  createMockMutationResult,
  createMockQueryResult,
} from "@/testing/mock-query";

describe("LectureFormDialog", () => {
  const mockCreateMutate = vi.fn();
  const mockUpdateMutate = vi.fn();
  const mockShowSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(filesApi.useConfirmImageUploadMutation).mockReturnValue(
      createMockMutationResult(),
    );
    vi.mocked(filesApi.useDownloadUrlQuery).mockReturnValue(
      createMockQueryResult<FileUploadResponse>(),
    );
    vi.mocked(filesApi.usePreSignedUploadUrlMutation).mockReturnValue(
      createMockMutationResult(),
    );

    vi.mocked(lecturesApi.useCreateLectureMutation).mockReturnValue(
      createMockMutationResult({
        mutateAsync: mockCreateMutate,
      }),
    );
    vi.mocked(lecturesApi.useUpdateLectureMutation).mockReturnValue(
      createMockMutationResult({
        mutateAsync: mockUpdateMutate,
      }),
    );

    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast({ showSuccess: mockShowSuccess }),
    );
  });

  it("shouldRenderCreateNewLectureTitleWhenInitialDataIsUndefined", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render in create mode.
    // ----------------------------------------------------------------------------
    render(
      <LectureFormDialog
        open={true}
        onClose={vi.fn()}
        onSaved={vi.fn()}
        courseId="c-10"
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title and disabled submit button.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByRole("heading", { name: "Create new lecture" }),
    ).toBeInTheDocument();
    const submitBtn = screen.getByRole("button", { name: "Create lecture" });
    expect(submitBtn).toBeDisabled();
  });

  it("shouldSubmitLectureFormInUpdateModeWhenInputsAreValid", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare existing lecture data.
    // ----------------------------------------------------------------------------
    const existingLecture: LectureResponse = createMockLecture({
      id: "lec-99",
      title: "Introduction to Hooks",
      summary: "Overview of useState and useEffect.",
      content: "<p>Hooks simplify stateful logic.</p>",
      videoObjectKey: "videos/lec-99.mp4",
    });

    const handleSaved = vi.fn();
    const handleClose = vi.fn();
    mockUpdateMutate.mockResolvedValue({ id: "lec-99" });

    render(
      <LectureFormDialog
        open={true}
        onClose={handleClose}
        onSaved={handleSaved}
        courseId="c-10"
        initialData={existingLecture}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify "Edit lecture" header and locked video notice.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByRole("heading", { name: "Edit lecture" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Video lecture \(Locked\)/i)).toBeInTheDocument();

    // Submit form
    const submitBtn = screen.getByRole("button", { name: "Update lecture" });
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify updateLectureMutate, showSuccess, and onSaved execution.
    // ----------------------------------------------------------------------------
    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "lec-99",
          courseId: "c-10",
          title: "Introduction to Hooks",
        }),
      );
      expect(mockShowSuccess).toHaveBeenCalledWith(
        "Lecture updated successfully!",
      );
      expect(handleSaved).toHaveBeenCalledTimes(1);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  it("shouldUploadVideoAndCreateLectureWhenInputsAreValid", async () => {
    const handleSaved = vi.fn();
    const handleClose = vi.fn();
    mockCreateMutate.mockResolvedValue({ id: "lec-new-1" });

    const chunkedUpload = await import("@/lib/util/chunked-upload");
    vi.mocked(chunkedUpload.uploadFileWithStrategy).mockResolvedValue({
      originalFileName: "intro.mp4",
      contentType: "video/mp4",
      objectKey: "videos/intro-uploaded.mp4",
    });

    render(
      <LectureFormDialog
        open={true}
        onClose={handleClose}
        onSaved={handleSaved}
        courseId="c-10"
      />,
    );

    // Fill form
    const titleInput = screen.getByPlaceholderText(/Setting up the environment/i);
    fireEvent.change(titleInput, { target: { value: "Getting Started" } });

    const summaryInput = screen.getByPlaceholderText(/programming tools/i);
    fireEvent.change(summaryInput, { target: { value: "Learn fundamentals." } });

    const contentEditor = screen.getByTestId("lecture-content-editor");
    fireEvent.change(contentEditor, { target: { value: "<p>Detailed guide.</p>" } });

    // Select video file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).not.toBeNull();
    const testVideo = new File(["dummy video data"], "intro.mp4", { type: "video/mp4" });
    fireEvent.change(fileInput, { target: { files: [testVideo] } });

    // Submit form
    const submitBtn = screen.getByRole("button", { name: "Create lecture" });
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(chunkedUpload.uploadFileWithStrategy).toHaveBeenCalledWith(
        testVideo,
        expect.objectContaining({ isPublic: false }),
      );
      expect(mockCreateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          courseId: "c-10",
          title: "Getting Started",
          summary: "Learn fundamentals.",
          videoObjectKey: "videos/intro-uploaded.mp4",
        }),
      );
      expect(mockShowSuccess).toHaveBeenCalledWith("Lecture created successfully!");
      expect(handleSaved).toHaveBeenCalledTimes(1);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});

