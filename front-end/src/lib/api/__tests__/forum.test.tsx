/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/api/forum.ts
 *
 * Purpose
 * -------
 * Verify that forum API helper functions and React Query hooks handle post creation, feed queries, and save/unsave actions.
 *
 * Tested Features
 * ---------------
 * ✓ createForumPost API call (/api/v1/forum/posts)
 * ✓ getForumFeed API call (/api/v1/forum/posts/feed)
 * ✓ savePost and unsavePost API calls
 * ✓ useForumFeedQuery hook
 *
 * Covered Scenarios
 * -----------------
 * ✓ Forum post creation
 * ✓ Fetching forum feed
 * ✓ Post saving & unsaving
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/client" (apiGet, apiPost, apiPut, apiDelete)
 *
 * Not Covered
 * -----------
 * - Real backend DB operations
 *
 * Notes
 * -----
 * Unit test for forum API endpoints.
 */
import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createForumPost,
  getForumFeed,
  savePost,
  unsavePost,
  useForumFeedQuery,
} from "../forum";
import type { PostRequest } from "@/lib/type/forums";
import * as client from "../client";
vi.mock("../client", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));
describe("Forum API", () => {
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
  it("shouldCallApiPostForCreateForumPost", async () => {
    const mockPayload: PostRequest = {
      title: "New Discussion",
      content: "Post body",
      shortDescription: "Short desc",
      thumbObjectKey: "thumb.jpg",
    };
    const mockResponse = { id: "p-100", title: "New Discussion" };
    vi.mocked(client.apiPost).mockResolvedValue(mockResponse);
    const result = await createForumPost(mockPayload);
    expect(client.apiPost).toHaveBeenCalledWith(
      "/api/v1/forum/posts",
      mockPayload,
    );
    expect(result).toEqual(mockResponse);
  });
  it("shouldCallApiGetForForumFeed", async () => {
    const mockFeed = { contents: [{ id: "p-1" }], totalElements: 1 };
    vi.mocked(client.apiGet).mockResolvedValue(mockFeed);
    const result = await getForumFeed();
    expect(client.apiGet).toHaveBeenCalledWith("/api/v1/forum/posts/feed");
    expect(result).toEqual(mockFeed);
  });
  it("shouldCallApiPostForSavePostAndApiDeleteForUnsavePost", async () => {
    vi.mocked(client.apiPost).mockResolvedValue(undefined);
    vi.mocked(client.apiDelete).mockResolvedValue(undefined);
    await savePost("p-50");
    expect(client.apiPost).toHaveBeenCalledWith(
      "/api/v1/forum/posts/p-50/save",
      {},
    );
    await unsavePost("p-50");
    expect(client.apiDelete).toHaveBeenCalledWith(
      "/api/v1/forum/posts/p-50/save",
    );
  });
  it("shouldExecuteUseForumFeedQueryHook", async () => {
    const mockFeed = { contents: [{ id: "p-1" }], totalElements: 1 };
    vi.mocked(client.apiGet).mockResolvedValue(mockFeed);
    const { result } = renderHook(() => useForumFeedQuery(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockFeed);
  });
});
