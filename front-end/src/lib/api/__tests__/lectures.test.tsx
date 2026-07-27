/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/api/lectures.ts
 *
 * Purpose
 * -------
 * Verify that lectures API helper functions and React Query hooks query lectures, materials, and comments.
 *
 * Tested Features
 * ---------------
 * ✓ getLectureComments API call (/api/v1/lectures/comments/filter)
 * ✓ deleteLectureComment API call (/api/v1/lectures/comments?commentId=:id)
 * ✓ useLecturesByCourseQuery hook
 *
 * Covered Scenarios
 * -----------------
 * ✓ Fetching lecture comments
 * ✓ Deleting lecture comment
 * ✓ Querying course lectures list
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
 * Unit test for lectures API endpoints.
 */

import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  getLectureComments,
  deleteLectureComment,
  useLecturesByCourseQuery,
} from "../lectures";
import * as client from "../client";

vi.mock("../client", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

describe("Lectures API", () => {
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

  it("shouldCallApiPostForGetLectureComments", async () => {
    const mockRequest = { lectureId: "lec-10", size: 10 };
    const mockResponse = { contents: [{ id: "comm-1" }], nextCursor: null };
    vi.mocked(client.apiPost).mockResolvedValue(mockResponse);

    const result = await getLectureComments(mockRequest as any);

    expect(client.apiPost).toHaveBeenCalledWith(
      "/api/v1/lectures/comments/filter",
      mockRequest,
    );
    expect(result).toEqual(mockResponse);
  });

  it("shouldCallApiDeleteForDeleteLectureComment", async () => {
    vi.mocked(client.apiDelete).mockResolvedValue(undefined);

    await deleteLectureComment("comm-99");

    expect(client.apiDelete).toHaveBeenCalledWith(
      "/api/v1/lectures/comments?commentId=comm-99",
    );
  });

  it("shouldExecuteUseLecturesByCourseQueryHook", async () => {
    const mockLectures = [{ id: "lec-1", title: "Introduction" }];
    vi.mocked(client.apiGet).mockResolvedValue(mockLectures);

    const { result } = renderHook(
      () => useLecturesByCourseQuery("course-100"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockLectures);
  });
});
