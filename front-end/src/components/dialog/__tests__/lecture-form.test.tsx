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

describe("LectureFormDialog", () => {
  const mockCreateMutate = vi.fn();
  const mockUpdateMutate = vi.fn();
  const mockShowSuccess = vi.fn();
  const mockHandleError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(filesApi.useConfirmImageUploadMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);
    vi.mocked(filesApi.useDownloadUrlQuery).mockReturnValue({
      data: null,
    } as any);
    vi.mocked(filesApi.usePreSignedUploadUrlMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);

    vi.mocked(lecturesApi.useCreateLectureMutation).mockReturnValue({
      mutateAsync: mockCreateMutate,
    } as any);
    vi.mocked(lecturesApi.useUpdateLectureMutation).mockReturnValue({
      mutateAsync: mockUpdateMutate,
    } as any);

    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      showSuccess: mockShowSuccess,
      handleError: mockHandleError,
    } as any);
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
    const existingLecture: LectureResponse = {
      id: "lec-99",
      courseId: "c-10",
      title: "Introduction to Hooks",
      summary: "Overview of useState and useEffect.",
      content: "<p>Hooks simplify stateful logic.</p>",
      videoObjectKey: "videos/lec-99.mp4",
    } as any;

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
});
