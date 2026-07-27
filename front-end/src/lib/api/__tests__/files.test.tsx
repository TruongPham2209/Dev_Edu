/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/api/files.ts
 *
 * Purpose
 * -------
 * Verify that files API helper functions and React Query hooks handle pre-signed upload URLs and download URL queries.
 *
 * Tested Features
 * ---------------
 * ✓ getPreSignedUploadUrl API call (/api/v1/files/pre-signed-url)
 * ✓ getDownloadUrl API call (/api/v1/files/download)
 * ✓ useDownloadUrlQuery hook
 *
 * Covered Scenarios
 * -----------------
 * ✓ Presigning upload URLs
 * ✓ Fetching download URLs
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/client" (apiGet, apiPost)
 *
 * Not Covered
 * -----------
 * - Real S3 file storage transfers
 *
 * Notes
 * -----
 * Unit test for files API endpoints.
 */

import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  getPreSignedUploadUrl,
  getDownloadUrl,
  useDownloadUrlQuery,
} from "../files";
import * as client from "../client";

vi.mock("../client", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

describe("Files API", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("shouldCallApiPostForPreSignedUploadUrl", async () => {
    const mockRequest = {
      fileName: "avatar.jpg",
      contentType: "image/jpeg",
      fileSize: 1024,
      isPublic: true,
    };
    const mockResponse = {
      uploadUrl: "https://s3.aws.com/upload",
      objectKey: "avatars/avatar.jpg",
    };

    vi.mocked(client.apiPost).mockResolvedValue(mockResponse);

    const result = await getPreSignedUploadUrl(mockRequest);

    expect(client.apiPost).toHaveBeenCalledWith(
      "/api/v1/files/pre-signed-url",
      mockRequest,
    );
    expect(result).toEqual(mockResponse);
  });

  it("shouldCallApiGetForDownloadUrl", async () => {
    const mockResponse = { downloadUrl: "https://s3.aws.com/download.jpg" };
    vi.mocked(client.apiGet).mockResolvedValue(mockResponse);

    const result = await getDownloadUrl("avatars/avatar.jpg");

    expect(client.apiGet).toHaveBeenCalledWith(
      "/api/v1/files/download?fullObjectKey=avatars%2Favatar.jpg",
    );
    expect(result).toEqual(mockResponse);
  });

  it("shouldExecuteUseDownloadUrlQueryHook", async () => {
    const mockResponse = { downloadUrl: "https://s3.aws.com/download.jpg" };
    vi.mocked(client.apiGet).mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () => useDownloadUrlQuery("avatars/avatar.jpg"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockResponse);
  });
});
