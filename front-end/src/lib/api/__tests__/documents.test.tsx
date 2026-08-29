import React from "react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  getGlobalDocuments,
  uploadGlobalDocument,
  deleteGlobalDocument,
  getCourseDocumentAudits,
  useGlobalDocumentsQuery,
  useUploadGlobalDocumentMutation,
  useDeleteGlobalDocumentMutation,
  useCourseDocumentAuditsQuery,
} from "../documents";
import * as client from "../client";

vi.mock("../client", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
  apiPostFormData: vi.fn(),
}));

describe("Documents API Service", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  const createWrapper = () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    Wrapper.displayName = "TestQueryWrapper";
    return Wrapper;
  };

  describe("Pure Async API Functions", () => {
    it("should fetch global documents without search params", async () => {
      const mockData = { content: [{ id: "doc-1", title: "Test Doc" }] };
      vi.mocked(client.apiGet).mockResolvedValue(mockData);

      const result = await getGlobalDocuments();
      expect(client.apiGet).toHaveBeenCalledWith("/api/v1/documents/library");
      expect(result).toEqual(mockData);
    });

    it("should fetch global documents with fileName and nextCursor", async () => {
      const mockData = { content: [] };
      vi.mocked(client.apiGet).mockResolvedValue(mockData);

      await getGlobalDocuments("java", "cursor-123");
      expect(client.apiGet).toHaveBeenCalledWith(
        "/api/v1/documents/library?fileName=java&nextCursor=cursor-123",
      );
    });

    it("should upload global document with FormData", async () => {
      const mockFile = new File(["dummy content"], "test.pdf", {
        type: "application/pdf",
      });
      const mockResponse = { id: "doc-new", fileName: "test.pdf" };
      vi.mocked(client.apiPostFormData).mockResolvedValue(mockResponse);

      const result = await uploadGlobalDocument({
        file: mockFile,
        title: "Test PDF Title",
      });

      expect(client.apiPostFormData).toHaveBeenCalledWith(
        "/api/v1/documents/library/upload",
        expect.any(FormData),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should delete global document", async () => {
      vi.mocked(client.apiDelete).mockResolvedValue("Deleted successfully");

      const result = await deleteGlobalDocument("doc-1");
      expect(client.apiDelete).toHaveBeenCalledWith(
        "/api/v1/documents/library/doc-1",
      );
      expect(result).toBe("Deleted successfully");
    });

    it("should get course document audits", async () => {
      const mockAudits = [{ id: "audit-1", fileName: "test.pdf" }];
      vi.mocked(client.apiGet).mockResolvedValue(mockAudits);

      const result = await getCourseDocumentAudits("course-1");
      expect(client.apiGet).toHaveBeenCalledWith(
        "/api/v1/documents/audits/course/course-1",
      );
      expect(result).toEqual(mockAudits);
    });
  });

  describe("React Query Hooks", () => {
    it("should fetch documents via useGlobalDocumentsQuery", async () => {
      const mockData = { content: [{ id: "doc-1" }] };
      vi.mocked(client.apiGet).mockResolvedValue(mockData);

      const { result } = renderHook(
        () => useGlobalDocumentsQuery("test"),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
    });

    it("should execute upload mutation and invalidate queries", async () => {
      vi.mocked(client.apiPostFormData).mockResolvedValue({ id: "doc-1" });
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(
        () => useUploadGlobalDocumentMutation(),
        { wrapper: createWrapper() },
      );

      const mockFile = new File(["dummy"], "file.pdf", { type: "application/pdf" });
      result.current.mutate({ file: mockFile, title: "Title" });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(invalidateSpy).toHaveBeenCalled();
    });

    it("should execute delete mutation and invalidate queries", async () => {
      vi.mocked(client.apiDelete).mockResolvedValue("Deleted");
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(
        () => useDeleteGlobalDocumentMutation(),
        { wrapper: createWrapper() },
      );

      result.current.mutate("doc-1");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(invalidateSpy).toHaveBeenCalled();
    });

    it("should fetch audits via useCourseDocumentAuditsQuery", async () => {
      const mockAudits = [{ id: "audit-1" }];
      vi.mocked(client.apiGet).mockResolvedValue(mockAudits);

      const { result } = renderHook(
        () => useCourseDocumentAuditsQuery("c-1"),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockAudits);
    });
  });
});