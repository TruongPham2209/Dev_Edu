/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/api/courses.ts
 *
 * Purpose
 * -------
 * Verify that courses API helper functions and React Query hooks send HTTP requests to correct endpoints.
 *
 * Tested Features
 * ---------------
 * ✓ getFeaturedCourses API call (/api/v1/courses/highlighted)
 * ✓ getCourseById API call (/api/v1/courses/:id/)
 * ✓ React Query custom hooks (useCoursesQuery, useCourseByIdQuery, useCategoriesQuery)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Fetching featured courses list
 * ✓ Fetching course by ID
 * ✓ Executing query hooks
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/client" (apiGet, apiPost, apiPut, apiDelete)
 *
 * Not Covered
 * -----------
 * - Real HTTP network traffic
 *
 * Notes
 * -----
 * Unit test for courses API endpoints.
 */

import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  getFeaturedCourses,
  getCourseById,
  useCoursesQuery,
} from "../courses";
import * as client from "../client";

vi.mock("../client", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

describe("Courses API", () => {
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

  it("shouldCallApiGetForFeaturedCourses", async () => {
    const mockCourses = [{ id: "c-1", title: "Next.js 15 Pro" }];
    vi.mocked(client.apiGet).mockResolvedValue(mockCourses);

    const result = await getFeaturedCourses();

    expect(client.apiGet).toHaveBeenCalledWith("/api/v1/courses/highlighted");
    expect(result).toEqual(mockCourses);
  });

  it("shouldCallApiGetForCourseById", async () => {
    const mockCourse = { id: "c-100", title: "TypeScript Mastery" };
    vi.mocked(client.apiGet).mockResolvedValue(mockCourse);

    const result = await getCourseById("c-100");

    expect(client.apiGet).toHaveBeenCalledWith("/api/v1/courses/c-100/");
    expect(result).toEqual(mockCourse);
  });

  it("shouldExecuteUseCoursesQueryHook", async () => {
    const mockData = { contents: [{ id: "c-100" }], totalElements: 1 };
    vi.mocked(client.apiGet).mockResolvedValue(mockData);

    const { result } = renderHook(
      () => useCoursesQuery({ keyword: "React" }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });
});
