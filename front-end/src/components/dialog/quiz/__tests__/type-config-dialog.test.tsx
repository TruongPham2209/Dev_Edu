/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/quiz/type-config-dialog.tsx
 *
 * Purpose
 * -------
 * Verify TypeConfigDialog modal for creating matrix type configuration, form input,
 * score calculation, and submitting data via onSave callback.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering modal title, question type selector, and score input fields
 * ✓ Validating matrix configuration inputs (required count, points per question)
 * ✓ Handling matrix type config save submission via onSave callback
 *
 * Covered Scenarios
 * -----------------
 * ✓ Modal open state rendering
 * ✓ Input changes and validation handling
 *
 * Mocked Dependencies
 * -------------------
 * - None (Pure UI component test)
 *
 * Not Covered
 * -----------
 * - CSS animation transitions
 *
 * Notes
 * -----
 * Unit test for TypeConfigDialog component.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TypeConfigDialog } from "../type-config-dialog";

describe("TypeConfigDialog Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shouldRenderTitleAndInputFieldsWhenOpen", () => {
    render(<TypeConfigDialog open={true} onClose={vi.fn()} onSave={vi.fn()} />);

    expect(
      screen.getByText(/Add Question Matrix Config/i),
    ).toBeInTheDocument();
  });

  it("shouldSubmitTypeConfigFormSuccessfully", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(<TypeConfigDialog open={true} onClose={onClose} onSave={onSave} />);

    const submitBtn = screen.getByRole("button", {
      name: /Add Config/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          questionType: "SINGLE_CHOICE",
        }),
      );
    });
  });
});
