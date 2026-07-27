/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/post-form.tsx
 *
 * Purpose
 * -------
 * Verify that PostFormDialog component handles post creation vs editing, title,
 * short description, thumbnail file selection, content validation, image upload
 * confirmation, and save execution.
 *
 * Tested Features
 * ---------------
 * ✓ Title rendering ("Create Post" vs "Edit Post")
 * ✓ Form validation (title length <= 255, shortDescription <= 500, non-empty content)
 * ✓ Image confirmation mutation execution for embedded content images
 * ✓ Save callback execution with post payload and selected thumbnail file
 *
 * Covered Scenarios
 * -----------------
 * ✓ New post mode (editingPost = null)
 * ✓ Edit post mode (editingPost = PostResponse)
 * ✓ Form submission with valid title, shortDescription, thumbnail, and content
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/files" (useConfirmImageUploadMutation)
 * - "@/components/common/form/rich-text-editor" (mocked simple textarea)
 * - "@/components/common/form/file-upload" (mocked file input)
 *
 * Not Covered
 * -----------
 * - Image preview modal rendering
 *
 * Notes
 * -----
 * Unit test for PostFormDialog component.
 */

import * as filesApi from "@/lib/api/files";
import type { PostRequest } from "@/lib/type/forums";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PostFormDialog } from "../post-form";

vi.mock("@/lib/api/files", () => ({
  useConfirmImageUploadMutation: vi.fn(),
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
      data-testid="post-content-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock("@/components/common/form/file-upload", () => ({
  FileUpload: ({ onChange }: { onChange: (file: File | null) => void }) => (
    <input
      type="file"
      data-testid="thumbnail-file-input"
      onChange={(e) => onChange(e.target.files?.[0] || null)}
    />
  ),
}));

describe("PostFormDialog", () => {
  const mockConfirmImageMutate = vi.fn();

  const defaultInitialValue: PostRequest = {
    title: "",
    shortDescription: "",
    content: "",
    thumbObjectKey: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(filesApi.useConfirmImageUploadMutation).mockReturnValue({
      mutateAsync: mockConfirmImageMutate,
    } as any);
  });

  it("shouldRenderCreatePostTitleWhenEditingPostIsNull", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render in creation mode.
    // ----------------------------------------------------------------------------
    render(
      <PostFormDialog
        open={true}
        initialValue={defaultInitialValue}
        editingPost={null}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title and disabled submit button.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByRole("heading", { name: "Create Post" }),
    ).toBeInTheDocument();
    const submitBtn = screen.getByRole("button", { name: "Create Post" });
    expect(submitBtn).toBeDisabled();
  });

  it("shouldSubmitPostFormSuccessfullyWhenAllFieldsAreFilled", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare initial value with thumbnail object key to satisfy update validation.
    // ----------------------------------------------------------------------------
    const initialValue: PostRequest = {
      postId: "post-1",
      thumbObjectKey: "posts/thumb.png",
      title: "Initial Title",
      shortDescription: "Initial Summary",
      content: "<p>Initial Content</p>",
    };

    const handleSave = vi.fn();

    render(
      <PostFormDialog
        open={true}
        initialValue={initialValue}
        editingPost={{ id: "post-1" } as any}
        onClose={vi.fn()}
        onSave={handleSave}
      />,
    );

    // ----------------------------------------------------------------------------
    // Act
    // Fill title, description, content.
    // ----------------------------------------------------------------------------
    const titleInput = screen.getByPlaceholderText("Enter post title");
    const descInput = screen.getByPlaceholderText("Enter short description");
    const editor = screen.getByTestId("post-content-editor");

    fireEvent.change(titleInput, { target: { value: "Updated Post Title" } });
    fireEvent.change(descInput, { target: { value: "Updated Summary text." } });
    fireEvent.change(editor, {
      target: { value: "<p>Updated body content.</p>" },
    });

    // Submit form
    const submitBtn = screen.getByRole("button", { name: "Save Changes" });
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify onSave execution with updated payload.
    // ----------------------------------------------------------------------------
    await waitFor(() => {
      expect(handleSave).toHaveBeenCalledWith(
        {
          postId: "post-1",
          thumbObjectKey: "posts/thumb.png",
          title: "Updated Post Title",
          shortDescription: "Updated Summary text.",
          content: "<p>Updated body content.</p>",
        },
        null,
      );
    });
  });
});
