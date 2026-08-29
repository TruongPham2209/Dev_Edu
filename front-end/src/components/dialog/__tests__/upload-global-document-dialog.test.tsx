import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UploadGlobalDocumentDialog } from "../../global-document-dialog";

describe("UploadGlobalDocumentDialog", () => {
  it("should render dialog title and drag & drop zone when open", () => {
    render(
      <UploadGlobalDocumentDialog
        open={true}
        onClose={vi.fn()}
        onUpload={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Upload Global Reference Document"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Drag and drop your file here/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Supports PDF/i),
    ).toBeInTheDocument();
  });

  it("should disable submit button when no file is selected", () => {
    render(
      <UploadGlobalDocumentDialog
        open={true}
        onClose={vi.fn()}
        onUpload={vi.fn()}
      />,
    );

    const submitBtn = screen.getByRole("button", { name: /Upload Document/i });
    expect(submitBtn).toBeDisabled();
  });
});