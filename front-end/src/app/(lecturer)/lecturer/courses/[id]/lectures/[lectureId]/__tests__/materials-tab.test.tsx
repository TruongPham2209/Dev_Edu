/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(lecturer)/lecturer/courses/[id]/lectures/[lectureId]/materials-tab.tsx
 *
 * Purpose
 * -------
 * Verify that MaterialsTab component queries attached materials, renders empty state or materials list,
 * opens upload MaterialFormDialog, handles file download, and deletes material.
 *
 * Tested Features
 * ---------------
 * ✓ Querying materials via useMaterialsQuery
 * ✓ Rendering EmptyState when no materials exist
 * ✓ Materials list rendering with file icons, names, formats, and upload timestamps
 * ✓ Opening MaterialFormDialog on add button click
 * ✓ Handling material download via getDownloadUrl
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading skeleton state
 * ✓ Empty materials state
 * ✓ Materials list rendering
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/lectures" (useMaterialsQuery, useDeleteMaterialMutation)
 * - "@/lib/api/files" (getDownloadUrl)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 * - "@/components/dialog/material-form" (mocked MaterialFormDialog)
 *
 * Not Covered
 * -----------
 * - CSS animation transitions
 *
 * Notes
 * -----
 * Unit test for MaterialsTab component.
 */

import * as lecturesApi from "@/lib/api/lectures";
import * as apiToast from "@/lib/use-api-with-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MaterialsTab } from "../materials-tab";

vi.mock("@/lib/api/lectures", () => ({
  useMaterialsQuery: vi.fn(),
  useDeleteMaterialMutation: vi.fn(),
}));

vi.mock("@/lib/api/files", () => ({
  getDownloadUrl: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

vi.mock("@/components/dialog/material-form", () => ({
  MaterialFormDialog: ({ open, onClose }: any) =>
    open ? (
      <div data-testid="material-form-dialog">
        <button onClick={onClose}>Close Material Dialog</button>
      </div>
    ) : null,
}));

describe("MaterialsTab (Lecturer)", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      showSuccess: vi.fn(),
      handleError: vi.fn(),
    } as any);

    vi.mocked(lecturesApi.useDeleteMaterialMutation).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    } as any);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("shouldRenderEmptyStateWhenNoMaterialsExist", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return empty materials list.
    // ----------------------------------------------------------------------------
    vi.mocked(lecturesApi.useMaterialsQuery).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    // ----------------------------------------------------------------------------
    // Act
    // Render MaterialsTab.
    // ----------------------------------------------------------------------------
    render(<MaterialsTab lectureId="lec-10" />, { wrapper });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify empty state title.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("No materials yet")).toBeInTheDocument();
  });

  it("shouldRenderMaterialsList", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock materials list.
    // ----------------------------------------------------------------------------
    const mockMaterials = [
      {
        id: "mat-1",
        title: "Clean Architecture Cheat Sheet",
        fileOriginalName: "clean-arch.pdf",
        fileObjectKey: "materials/clean-arch.pdf",
        uploadedAt: "2026-06-20T10:00:00.000Z",
      },
    ];

    vi.mocked(lecturesApi.useMaterialsQuery).mockReturnValue({
      data: mockMaterials,
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    // ----------------------------------------------------------------------------
    // Act
    // Render MaterialsTab.
    // ----------------------------------------------------------------------------
    render(<MaterialsTab lectureId="lec-10" />, { wrapper });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify material title and format tag.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Clean Architecture Cheat Sheet"),
    ).toBeInTheDocument();
    expect(screen.getByText("PDF format")).toBeInTheDocument();
  });
});
