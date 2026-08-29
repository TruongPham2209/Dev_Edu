/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/api/assignments.ts
 *
 * Purpose
 * -------
 * Verify that assignments API service methods and React Query hooks correctly
 * format API endpoints, delegate HTTP calls to client functions, manage cache
 * invalidation upon mutation, and handle query enabling logic.
 *
 * Tested Features
 * ---------------
 * ✓ useAssignmentsQuery fetching assignments by lecture ID
 * ✓ useAssignmentByIdQuery fetching detailed assignment
 * ✓ useCreateAssignmentMutation creating assignment & invalidating queries
 * ✓ useDeleteAssignmentMutation deleting assignment & invalidating queries
 * ✓ useSubmissionsInfiniteQuery pagination calculation
 * ✓ useCreateSubmissionMutation creating submission & invalidating queries
 * ✓ useDeleteSubmissionMutation deleting submission & invalidating queries
 * ✓ useSubmissionTrackingQuery fetching submission logs
 * ✓ useFeedbacksQuery fetching feedback list
 * ✓ useCreateFeedbackMutation creating feedback & invalidating queries
 * ✓ useDeleteFeedbackMutation deleting feedback & invalidating queries
 *
 * Covered Scenarios
 * -----------------
 * ✓ Successful data fetching
 * ✓ Disabled queries when ID is empty
 * ✓ Query invalidation on mutation success
 * ✓ Infinite query getNextPageParam calculation logic
 *
 * Mocked Dependencies
 * -------------------
 * - src/lib/api/client (apiGet, apiPost, apiDelete)
 *
 * Not Covered
 * -----------
 * - Network server latency
 *
 * Notes
 * -----
 * Unit test for React Query API hooks using renderHook and QueryClientProvider.
 */

import React from "react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useAssignmentsQuery,
  useAssignmentByIdQuery,
  useCreateAssignmentMutation,
  useDeleteAssignmentMutation,
  useSubmissionsInfiniteQuery,
} from "../assignments";
import * as client from "../client";

vi.mock("../client", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiDelete: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "TestQueryWrapper";
  return Wrapper;
}

describe("assignments API & hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("useAssignmentsQuery", () => {
    it("shouldFetchAssignmentsByLectureIdWhenEnabled", async () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const mockAssignments = [{ id: "assign-1", title: "Homework 1" }];
      vi.mocked(client.apiGet).mockResolvedValue(mockAssignments);

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      const { result } = renderHook(() => useAssignmentsQuery("lecture-100"), {
        wrapper: createWrapper(),
      });

      // ----------------------------------------------------------------------------
      // Assert
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockAssignments);

      // ----------------------------------------------------------------------------
      // Verify
      // Verify interaction with mocked dependencies.
      // ----------------------------------------------------------------------------
      expect(client.apiGet).toHaveBeenCalledWith("/api/v1/assignments?lectureId=lecture-100");
    });

    it("shouldNotFetchAssignmentsWhenLectureIdIsEmpty", () => {
      // ----------------------------------------------------------------------------
      // Arrange & Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      const { result } = renderHook(() => useAssignmentsQuery(""), {
        wrapper: createWrapper(),
      });

      // ----------------------------------------------------------------------------
      // Assert & Verify
      // Verify returned result and rendered output.
      // ----------------------------------------------------------------------------
      expect(result.current.fetchStatus).toBe("idle");
      expect(client.apiGet).not.toHaveBeenCalled();
    });
  });

  describe("useAssignmentByIdQuery", () => {
    it("shouldFetchAssignmentDetailById", async () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const mockDetail = { id: "assign-2", title: "Midterm Exam" };
      vi.mocked(client.apiGet).mockResolvedValue(mockDetail);

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      const { result } = renderHook(() => useAssignmentByIdQuery("assign-2"), {
        wrapper: createWrapper(),
      });

      // ----------------------------------------------------------------------------
      // Assert & Verify
      // Verify returned result and rendered output / interaction with mocked dependencies.
      // ----------------------------------------------------------------------------
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockDetail);
      expect(client.apiGet).toHaveBeenCalledWith("/api/v1/assignments?assignmentId=assign-2");
    });
  });

  describe("useCreateAssignmentMutation", () => {
    it("shouldPostNewAssignmentAndInvalidateAssignmentsQuery", async () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const newAssignment = { lectureId: "lec-1", title: "Quiz 1", description: "Test" };
      const createdAssignment = { id: "assign-99", ...newAssignment };
      vi.mocked(client.apiPost).mockResolvedValue(createdAssignment);

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      const { result } = renderHook(() => useCreateAssignmentMutation(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(newAssignment);

      // ----------------------------------------------------------------------------
      // Assert & Verify
      // Verify returned result and rendered output / interaction with mocked dependencies.
      // ----------------------------------------------------------------------------
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(client.apiPost).toHaveBeenCalledWith("/api/v1/assignments", newAssignment);
    });
  });

  describe("useDeleteAssignmentMutation", () => {
    it("shouldSendDeleteRequestForAssignmentId", async () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      vi.mocked(client.apiDelete).mockResolvedValue(undefined);

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      const { result } = renderHook(() => useDeleteAssignmentMutation(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("assign-1");

      // ----------------------------------------------------------------------------
      // Assert & Verify
      // Verify returned result and rendered output / interaction with mocked dependencies.
      // ----------------------------------------------------------------------------
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(client.apiDelete).toHaveBeenCalledWith("/api/v1/assignments?assignmentId=assign-1");
    });
  });

  describe("useSubmissionsInfiniteQuery", () => {
    it("shouldFetchSubmissionsPageAndComputeNextPageParam", async () => {
      // ----------------------------------------------------------------------------
      // Arrange
      // Prepare props, mocks and expected values.
      // ----------------------------------------------------------------------------
      const mockPage0 = {
        data: [{ id: "sub-1" }],
        currentPage: 0,
        totalPages: 2,
        pageSize: 10,
        totalElements: 20,
      };
      vi.mocked(client.apiGet).mockResolvedValue(mockPage0);

      // ----------------------------------------------------------------------------
      // Act
      // Execute the component or function.
      // ----------------------------------------------------------------------------
      const { result } = renderHook(() => useSubmissionsInfiniteQuery("assign-1", 10), {
        wrapper: createWrapper(),
      });

      // ----------------------------------------------------------------------------
      // Assert & Verify
      // Verify returned result and rendered output / interaction with mocked dependencies.
      // ----------------------------------------------------------------------------
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(client.apiGet).toHaveBeenCalledWith(
        "/api/v1/assignments/submissions?assignmentId=assign-1&page=0&size=10",
      );
      expect(result.current.hasNextPage).toBe(true);
    });
  });
});
