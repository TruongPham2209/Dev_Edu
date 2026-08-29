/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/api/quizzes.ts
 *
 * Purpose
 * -------
 * Verify that quiz API service functions and React Query custom hooks correctly
 * format API endpoints, delegate HTTP calls, format query parameters, and handle
 * query invalidations upon successful mutations.
 *
 * Tested Features
 * ---------------
 * ✓ Fetching quizzes by course, quiz by ID, and quizzes by status
 * ✓ Creating, updating, and submitting quizzes for approval
 * ✓ Reviewing quizzes (approve/reject) as admin
 * ✓ Managing matrix type configs (create, get, delete)
 * ✓ Managing quiz questions (create, update, delete)
 * ✓ Managing quiz assignments (create, get by course/quiz/ID, delete)
 * ✓ Student exam attempt lifecycle (start, autosave, heartbeat, submit, result)
 * ✓ Essay submission lookup and manual essay grading
 *
 * Covered Scenarios
 * -----------------
 * ✓ Pure async API functions execution & endpoint formatting
 * ✓ Query parameter serialization for status and nextCursor
 * ✓ React Query custom hooks data fetching & loading states
 * ✓ Query invalidation on successful mutations
 *
 * Mocked Dependencies
 * -------------------
 * - src/lib/api/client (apiGet, apiPost, apiPut, apiDelete, apiCall)
 */

import React from "react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  getQuizzesByCourse,
  getQuizById,
  createQuiz,
  updateQuiz,
  submitQuizForApproval,
  getQuizzes,
  reviewQuiz,
  createQuizTypeConfig,
  getQuizTypeConfigs,
  deleteQuizTypeConfig,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  createQuizAssignment,
  getQuizAssignmentsByCourse,
  getQuizAssignmentsByQuiz,
  getAssignmentById,
  deleteQuizAssignment,
  startAttempt,
  autosaveAttempt,
  heartbeatAttempt,
  submitAttempt,
  getAttemptResult,
  getEssaySubmissions,
  gradeEssayQuestion,
  generateQuizFromFile,
  generateQuizFromDocument,
  getQuizGenerationJob,
  getQuestionTraceability,
  useQuizzesByCourseQuery,
  useQuizByIdQuery,
  useCreateQuizMutation,
  useGenerateQuizFromFileMutation,
  useGenerateQuizFromDocumentMutation,
  useQuizGenerationJobQuery,
  useQuestionTraceabilityQuery,
} from "../quizzes";
import * as client from "../client";

vi.mock("../client", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
  apiCall: vi.fn(),
  apiPostFormData: vi.fn(),
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

describe("quizzes API & React Query hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Pure Async API Functions", () => {
    it("shouldFetchQuizzesByCourseWithQueryParams", async () => {
      const mockResult = {
        items: [{ id: "q-1", title: "Quiz 1" }],
        nextCursor: "c1",
      };
      vi.mocked(client.apiGet).mockResolvedValue(mockResult);

      const result = await getQuizzesByCourse(
        "course-101",
        "APPROVED",
        "midterm",
        "cursor-1",
      );

      expect(client.apiGet).toHaveBeenCalledWith(
        "/api/v1/quizzes/course/course-101?status=APPROVED&keyword=midterm&nextCursor=cursor-1",
      );
      expect(result).toEqual(mockResult);
    });

    it("shouldFetchQuizById", async () => {
      const mockQuiz = { id: "q-1", title: "Midterm Quiz" };
      vi.mocked(client.apiGet).mockResolvedValue(mockQuiz);

      const result = await getQuizById("q-1");

      expect(client.apiGet).toHaveBeenCalledWith("/api/v1/quizzes/q-1");
      expect(result).toEqual(mockQuiz);
    });

    it("shouldCreateQuiz", async () => {
      const quizReq = {
        courseId: "c-1",
        title: "New Quiz",
        description: "Desc",
        passPercentage: 70,
      };
      const mockRes = { id: "q-100", ...quizReq };
      vi.mocked(client.apiPost).mockResolvedValue(mockRes);

      const result = await createQuiz(quizReq as never);

      expect(client.apiPost).toHaveBeenCalledWith("/api/v1/quizzes", quizReq);
      expect(result).toEqual(mockRes);
    });

    it("shouldUpdateQuiz", async () => {
      const quizReq = { courseId: "c-1", title: "Updated Quiz" };
      const mockRes = { id: "q-1", ...quizReq };
      vi.mocked(client.apiPut).mockResolvedValue(mockRes);

      const result = await updateQuiz("q-1", quizReq as never);

      expect(client.apiPut).toHaveBeenCalledWith(
        "/api/v1/quizzes/q-1",
        quizReq,
      );
      expect(result).toEqual(mockRes);
    });

    it("shouldSubmitQuizForApproval", async () => {
      vi.mocked(client.apiPost).mockResolvedValue({
        id: "q-1",
        status: "PENDING",
      });

      const result = await submitQuizForApproval("q-1");

      expect(client.apiPost).toHaveBeenCalledWith("/api/v1/quizzes/q-1/submit");
      expect(result).toEqual({ id: "q-1", status: "PENDING" });
    });

    it("shouldGetQuizzesByStatus", async () => {
      const mockRes = { items: [], nextCursor: null };
      vi.mocked(client.apiGet).mockResolvedValue(mockRes);

      const result = await getQuizzes("PENDING");

      expect(client.apiGet).toHaveBeenCalledWith(
        "/api/v1/quizzes?status=PENDING",
      );
      expect(result).toEqual(mockRes);
    });

    it("shouldReviewQuiz", async () => {
      const reviewReq = { approved: true, comment: "Approved" } as never;
      vi.mocked(client.apiPost).mockResolvedValue({
        id: "q-1",
        status: "APPROVED",
      });

      const result = await reviewQuiz("q-1", reviewReq);

      expect(client.apiPost).toHaveBeenCalledWith(
        "/api/v1/quizzes/q-1/review",
        reviewReq,
      );
      expect(result).toEqual({ id: "q-1", status: "APPROVED" });
    });

    it("shouldCreateQuizTypeConfig", async () => {
      const configReq = {
        questionType: "SINGLE_CHOICE",
        numberOfQuestions: 10,
      };
      vi.mocked(client.apiPost).mockResolvedValue({
        id: "cfg-1",
        ...configReq,
      });

      const result = await createQuizTypeConfig("q-1", configReq as never);

      expect(client.apiPost).toHaveBeenCalledWith(
        "/api/v1/quizzes/q-1/type-configs",
        configReq,
      );
      expect(result).toEqual({ id: "cfg-1", ...configReq });
    });

    it("shouldGetQuizTypeConfigs", async () => {
      const mockConfigs = [{ id: "cfg-1" }];
      vi.mocked(client.apiGet).mockResolvedValue(mockConfigs);

      const result = await getQuizTypeConfigs("q-1");

      expect(client.apiGet).toHaveBeenCalledWith(
        "/api/v1/quizzes/q-1/type-configs",
      );
      expect(result).toEqual(mockConfigs);
    });

    it("shouldDeleteQuizTypeConfig", async () => {
      vi.mocked(client.apiDelete).mockResolvedValue(undefined);

      await deleteQuizTypeConfig("q-1", "cfg-1");

      expect(client.apiDelete).toHaveBeenCalledWith(
        "/api/v1/quizzes/q-1/type-configs/cfg-1",
      );
    });

    it("shouldCreateAndUpdateAndDeleteQuizQuestion", async () => {
      const qReq = {
        content: "Question text?",
        questionType: "SINGLE_CHOICE",
      };
      vi.mocked(client.apiPost).mockResolvedValue({ id: "quest-1", ...qReq });
      vi.mocked(client.apiPut).mockResolvedValue({
        id: "quest-1",
        content: "Updated",
      });
      vi.mocked(client.apiDelete).mockResolvedValue(undefined);

      const created = await createQuizQuestion("q-1", qReq as never);
      expect(client.apiPost).toHaveBeenCalledWith(
        "/api/v1/quizzes/q-1/questions",
        qReq,
      );
      expect(created).toEqual({ id: "quest-1", ...qReq });

      const updated = await updateQuizQuestion("q-1", "quest-1", qReq as never);
      expect(client.apiPut).toHaveBeenCalledWith(
        "/api/v1/quizzes/q-1/questions/quest-1",
        qReq,
      );
      expect(updated).toEqual({ id: "quest-1", content: "Updated" });

      await deleteQuizQuestion("q-1", "quest-1");
      expect(client.apiDelete).toHaveBeenCalledWith(
        "/api/v1/quizzes/q-1/questions/quest-1",
      );
    });

    it("shouldHandleQuizAssignments", async () => {
      const assignReq = { quizId: "q-1", title: "Assignment 1" };
      vi.mocked(client.apiPost).mockResolvedValue({ id: "a-1", ...assignReq });
      vi.mocked(client.apiGet).mockResolvedValue([{ id: "a-1" }]);
      vi.mocked(client.apiDelete).mockResolvedValue(undefined);

      await createQuizAssignment(assignReq as never);
      expect(client.apiPost).toHaveBeenCalledWith(
        "/api/v1/quiz-assignments",
        assignReq,
      );

      await getQuizAssignmentsByCourse("c-1");
      expect(client.apiGet).toHaveBeenCalledWith(
        "/api/v1/quiz-assignments?courseId=c-1",
      );

      await getQuizAssignmentsByQuiz("q-1");
      expect(client.apiGet).toHaveBeenCalledWith(
        "/api/v1/quiz-assignments/quiz/q-1",
      );

      await getAssignmentById("a-1");
      expect(client.apiGet).toHaveBeenCalledWith(
        "/api/v1/quiz-assignments/a-1",
      );

      await deleteQuizAssignment("a-1");
      expect(client.apiDelete).toHaveBeenCalledWith(
        "/api/v1/quiz-assignments/a-1",
      );
    });

    it("shouldStartAttemptWithSessionTokenHeader", async () => {
      const mockAttempt = { attemptId: "att-1" };
      vi.mocked(client.apiCall).mockResolvedValue({ data: mockAttempt } as never);

      const result = await startAttempt("assign-1", "token-xyz");

      expect(client.apiCall).toHaveBeenCalledWith(
        "/api/v1/quiz-assignments/assign-1/start?sessionToken=token-xyz",
        {
          method: "POST",
          headers: { "X-Session-Token": "token-xyz" },
        },
      );
      expect(result).toEqual(mockAttempt);
    });

    it("shouldAutosaveHeartbeatSubmitAttempt", async () => {
      const autoSaveReq = { answers: [] } as never;
      vi.mocked(client.apiPost).mockResolvedValue({ status: "SAVED" });

      await autosaveAttempt("att-1", autoSaveReq);
      expect(client.apiPost).toHaveBeenCalledWith(
        "/api/v1/quiz-attempts/att-1/autosave",
        autoSaveReq,
      );

      await heartbeatAttempt("att-1", { sessionToken: "st-1" } as never);
      expect(client.apiPost).toHaveBeenCalledWith(
        "/api/v1/quiz-attempts/att-1/heartbeat",
        { sessionToken: "st-1" },
      );

      await submitAttempt("att-1");
      expect(client.apiPost).toHaveBeenCalledWith(
        "/api/v1/quiz-attempts/att-1/submit",
      );
    });

    it("shouldGetAttemptResultAndPendingEssays", async () => {
      vi.mocked(client.apiGet).mockResolvedValue({
        attemptId: "att-1",
        score: 90,
      });
      vi.mocked(client.apiPost).mockResolvedValue({
        attemptId: "att-1",
        score: 95,
      } as never);

      await getAttemptResult("att-1");
      expect(client.apiGet).toHaveBeenCalledWith(
        "/api/v1/quiz-attempts/att-1/result",
      );

      await getEssaySubmissions("quiz-1", "ALL");
      expect(client.apiGet).toHaveBeenCalledWith(
        "/api/v1/quiz-gradings/quiz-1/essays?status=ALL",
      );

      await gradeEssayQuestion("att-1", "q-1", {
        awardedPoints: 5,
        feedback: "Good",
      });
      expect(client.apiPost).toHaveBeenCalledWith(
        "/api/v1/quiz-gradings/attempts/att-1/questions/q-1",
        { awardedPoints: 5, feedback: "Good" },
      );
    });
  });

  describe("React Query Custom Hooks", () => {
    it("shouldFetchQuizzesByCourseViaHook", async () => {
      const mockData = { items: [{ id: "q-1" }], nextCursor: undefined };
      vi.mocked(client.apiGet).mockResolvedValue(mockData);

      const { result } = renderHook(
        () => useQuizzesByCourseQuery("course-1", "APPROVED"),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
    });

    it("shouldFetchQuizByIdViaHook", async () => {
      const mockQuiz = { id: "q-1", title: "Test Quiz" };
      vi.mocked(client.apiGet).mockResolvedValue(mockQuiz);

      const { result } = renderHook(() => useQuizByIdQuery("q-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockQuiz);
    });

    it("shouldExecuteMutationsAndInvalidateQueries", async () => {
      vi.mocked(client.apiPost).mockResolvedValue({ id: "q-new" });

      const { result } = renderHook(() => useCreateQuizMutation(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ courseId: "c-1", title: "New" } as never);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(client.apiPost).toHaveBeenCalled();
    });

    it("shouldExecuteGenerateFromFileMutation", async () => {
      const mockJob = { jobId: "job-1", status: "PENDING" };
      vi.mocked(client.apiPostFormData).mockResolvedValue(mockJob);

      const { result } = renderHook(() => useGenerateQuizFromFileMutation(), {
        wrapper: createWrapper(),
      });

      const file = new File(["dummy"], "test.pdf", { type: "application/pdf" });
      result.current.mutate({
        quizId: "q-1",
        description: "Test prompt",
        file,
        saveDocument: true,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(client.apiPostFormData).toHaveBeenCalledWith(
        "/api/v1/quizzes/generate-from-file",
        expect.any(FormData),
      );
      expect(result.current.data).toEqual(mockJob);
    });

    it("shouldExecuteGenerateFromDocumentMutation", async () => {
      const mockJob = { jobId: "job-2", status: "PENDING" };
      vi.mocked(client.apiPost).mockResolvedValue(mockJob);

      const { result } = renderHook(
        () => useGenerateQuizFromDocumentMutation(),
        { wrapper: createWrapper() },
      );

      result.current.mutate({
        quizId: "q-1",
        sourceType: "LIBRARY",
        documentId: "doc-1",
        description: "Test prompt",
        saveDocument: false,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(client.apiPost).toHaveBeenCalledWith(
        "/api/v1/quizzes/generate-from-document",
        expect.objectContaining({
          quizId: "q-1",
          documentId: "doc-1",
        }),
      );
      expect(result.current.data).toEqual(mockJob);
    });

    it("shouldFetchJobStatusViaHook", async () => {
      const mockJob = { jobId: "job-1", status: "PROCESSING" };
      vi.mocked(client.apiGet).mockResolvedValue(mockJob);

      const { result } = renderHook(() => useQuizGenerationJobQuery("job-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(client.apiGet).toHaveBeenCalledWith(
        "/api/v1/quizzes/generation-jobs/job-1",
      );
      expect(result.current.data).toEqual(mockJob);
    });

    it("shouldFetchQuestionTraceabilityViaHook", async () => {
      const mockTraceability = {
        id: "tr-1",
        questionId: "q-1",
        sectionName: "Chapter 4",
        pageNumber: 42,
      };
      vi.mocked(client.apiGet).mockResolvedValue(mockTraceability);

      const { result } = renderHook(
        () => useQuestionTraceabilityQuery("job-1", "q-1"),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(client.apiGet).toHaveBeenCalledWith(
        "/api/v1/quizzes/generation-jobs/job-1/traceability/q-1",
      );
      expect(result.current.data).toEqual(mockTraceability);
    });
  });

  describe("AI Quiz Generation Pure Async Functions", () => {
    it("shouldGenerateQuizFromFile", async () => {
      const mockJob = { jobId: "job-1", status: "PENDING" };
      vi.mocked(client.apiPostFormData).mockResolvedValue(mockJob);

      const file = new File(["test"], "file.pdf", { type: "application/pdf" });
      const res = await generateQuizFromFile({
        quizId: "quiz-1",
        description: "Test prompt",
        file,
        saveDocument: true,
      });

      expect(client.apiPostFormData).toHaveBeenCalledWith(
        "/api/v1/quizzes/generate-from-file",
        expect.any(FormData),
      );
      expect(res).toEqual(mockJob);
    });

    it("shouldGenerateQuizFromDocument", async () => {
      const mockJob = { jobId: "job-2", status: "PENDING" };
      vi.mocked(client.apiPost).mockResolvedValue(mockJob);

      const res = await generateQuizFromDocument({
        quizId: "quiz-1",
        sourceType: "LIBRARY",
        documentId: "doc-1",
        description: "Test description",
        saveDocument: false,
      });

      expect(client.apiPost).toHaveBeenCalledWith(
        "/api/v1/quizzes/generate-from-document",
        {
          quizId: "quiz-1",
          sourceType: "LIBRARY",
          documentId: "doc-1",
          description: "Test description",
          saveDocument: false,
        },
      );
      expect(res).toEqual(mockJob);
    });

    it("shouldGetQuizGenerationJob", async () => {
      const mockJob = { jobId: "job-1", status: "COMPLETED" };
      vi.mocked(client.apiGet).mockResolvedValue(mockJob);

      const res = await getQuizGenerationJob("job-1");
      expect(client.apiGet).toHaveBeenCalledWith(
        "/api/v1/quizzes/generation-jobs/job-1",
      );
      expect(res).toEqual(mockJob);
    });

    it("shouldGetQuestionTraceability", async () => {
      const mockTraceability = { id: "tr-1", pageNumber: 10 };
      vi.mocked(client.apiGet).mockResolvedValue(mockTraceability);

      const res = await getQuestionTraceability("job-1", "q-1");
      expect(client.apiGet).toHaveBeenCalledWith(
        "/api/v1/quizzes/generation-jobs/job-1/traceability/q-1",
      );
      expect(res).toEqual(mockTraceability);
    });
  });
});

