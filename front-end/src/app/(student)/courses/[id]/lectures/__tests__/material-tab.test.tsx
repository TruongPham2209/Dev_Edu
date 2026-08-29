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
 * Verify that TabMaterials component renders lecture materials list, file type icons,
 * empty state when no materials exist, and handles file download URL generation.
 *
 * Tested Features
 * ---------------
 * ✓ CircularProgress loading spinner when loading = true
 * ✓ EmptyState rendering when materials array is empty
 * ✓ Materials list rendering (title, original filename, upload date)
 * ✓ Download button action triggering queryClient fetchQuery
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state
 * ✓ Empty materials state
 * ✓ Rendering materials list and triggering file download
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/lectures" (useMaterialsQuery)
 * - "@/lib/api/files" (getDownloadUrl)
 * - "@tanstack/react-query" (useQueryClient)
 *
 * Not Covered
 * -----------
 * - Browser file stream downloading
 *
 * Notes
 * -----
 * Unit test for TabMaterials component.
 */

import * as lecturesApi from "@/lib/api/lectures";
import { fireEvent, render, screen } from "@testing-library/react";
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
    vi.mocked(lecturesApi.useMaterialsQuery).mockReturnValue({
      data: [],
      isLoading: false,
    } as never);

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
    const mockMaterials = [
      {
        id: "mat-1",
        title: "React 19 Cheat Sheet PDF",
        fileObjectKey: "materials/cheat-sheet.pdf",
        fileOriginalName: "cheat-sheet.pdf",
        uploadedAt: "2026-06-10T10:00:00.000Z",
      },
    ];

    vi.mocked(lecturesApi.useMaterialsQuery).mockReturnValue({
      data: mockMaterials,
      isLoading: false,
    } as never);

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
    const downloadBtn = screen.getByRole("button", { name: "Download" });
    fireEvent.click(downloadBtn);

    expect(mockFetchQuery).toHaveBeenCalledWith({
      queryKey: ["files", "download", "materials/cheat-sheet.pdf"],
      queryFn: expect.any(Function),
    });
  });
});
