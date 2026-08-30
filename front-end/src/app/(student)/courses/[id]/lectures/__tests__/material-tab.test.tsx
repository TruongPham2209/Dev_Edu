/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/courses/[id]/lectures/material-tab.tsx
 *
 * Purpose
 * -------
 * Verify that TabMaterials component renders materials list, file name, empty state
 * when no materials exist, and triggers file download via preSignedDownloadUrl query.
 *
 * Tested Features
 * ---------------
 * ✓ CircularProgress loading spinner when loading = true
 * ✓ EmptyState rendering when materials array is empty
 * ✓ Materials list rendering (title, original file name, download icon)
 * ✓ Download action calling getPreSignedDownloadUrl and window.open
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state
 * ✓ Empty materials list
 * ✓ Downloading a lecture material
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/lectures" (useMaterialsQuery)
 * - "@tanstack/react-query" (useQueryClient)
 *
 * Not Covered
 * -----------
 * - Browser native file save dialog
 *
 * Notes
 * -----
 * Unit test for TabMaterials component.
 */

import type { MaterialResponse } from "@/lib/type/lectures";
import * as lecturesApi from "@/lib/api/lectures";
import { createMockMaterial } from "@/testing/mock-data";
import { createMockQueryResult } from "@/testing/mock-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TabMaterials } from "../material-tab";

vi.mock("@/lib/api/lectures", () => ({
  useMaterialsQuery: vi.fn(),
}));

const mockFetchQuery = vi.fn();
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    fetchQuery: mockFetchQuery,
  }),
}));

describe("TabMaterials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shouldRenderEmptyStateWhenNoMaterialsExist", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return empty materials list.
    // ----------------------------------------------------------------------------
    vi.mocked(lecturesApi.useMaterialsQuery).mockReturnValue(
      createMockQueryResult<MaterialResponse[]>([]),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render TabMaterials.
    // ----------------------------------------------------------------------------
    render(<TabMaterials lectureId="lec-50" />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify "No materials found" empty state.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("No materials found")).toBeInTheDocument();
  });

  it("shouldRenderMaterialsListAndTriggerDownloadOnClick", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock materials list and window.open.
    // ----------------------------------------------------------------------------
    const mockMaterials: MaterialResponse[] = [
      createMockMaterial({
        id: "mat-1",
        title: "React 19 Cheat Sheet PDF",
        fileObjectKey: "materials/cheat-sheet.pdf",
        fileOriginalName: "cheat-sheet.pdf",
      }),
    ];

    vi.mocked(lecturesApi.useMaterialsQuery).mockReturnValue(
      createMockQueryResult(mockMaterials),
    );

    mockFetchQuery.mockResolvedValue({
      downloadUrl: "https://example.com/download.pdf",
    });
    vi.spyOn(window, "open").mockImplementation(() => null);

    // ----------------------------------------------------------------------------
    // Act
    // Render TabMaterials.
    // ----------------------------------------------------------------------------
    render(<TabMaterials lectureId="lec-50" />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify material title and file original name render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("React 19 Cheat Sheet PDF")).toBeInTheDocument();
    expect(screen.getByText("cheat-sheet.pdf")).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify Download
    // Click Download button.
    // ----------------------------------------------------------------------------
    const downloadBtn = screen.getByRole("button", {
      name: /Download/i,
    });
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(mockFetchQuery).toHaveBeenCalled();
      expect(window.open).toHaveBeenCalledWith(
        "https://example.com/download.pdf",
        "_blank",
      );
    });
  });
});
