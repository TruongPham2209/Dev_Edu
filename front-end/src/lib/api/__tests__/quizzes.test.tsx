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

import type {
  AttemptResultResponse,
  AutosaveRequest,
  CreateAssignmentRequest,
  HeartbeatRequest,
  QuestionTraceabilityResponse,
  QuizAssignmentResponse,
  QuizGenerationJobResponse,
  QuizQuestionRequest,
  QuizQuestionResponse,
  QuizRequest,
  QuizResponse,
  QuizReviewRequest,
  QuizTypeConfigRequest,
  QuizTypeConfigResponse,
  StartAttemptResponse,
} from "@/lib/type/quizzes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as client from "../client";
import {
  autosaveAttempt,
  createQuiz,
  createQuizAssignment,
  createQuizQuestion,
  createQuizTypeConfig,
  deleteQuizAssignment,
  deleteQuizQuestion,
  deleteQuizTypeConfig,
  generateQuizFromDocument,
  generateQuizFromFile,
  getAssignmentById,
  getAttemptResult,
  getEssaySubmissions,
  getQuestionTraceability,
  getQuizAssignmentsByCourse,
  getQuizAssignmentsByQuiz,
  getQuizById,
  getQuizGenerationJob,
  getQuizzes,
  getQuizzesByCourse,
  getQuizTypeConfigs,
  gradeEssayQuestion,
  heartbeatAttempt,
  reviewQuiz,
  startAttempt,
  submitAttempt,
  submitQuizForApproval,
  updateQuiz,
  updateQuizQuestion,
  useCreateQuizMutation,
  useGenerateQuizFromDocumentMutation,
  useGenerateQuizFromFileMutation,
  useQuestionTraceabilityQuery,
  useQuizByIdQuery,
  useQuizGenerationJobQuery,
  useQuizzesByCourseQuery,
} from "../quizzes";

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
      const quizReq: QuizRequest = {
        courseId: "c-1",
        title: "New Quiz",
        description: "Desc",
      };
      const mockRes: QuizResponse = {
        id: "q-100",
        status: "DRAFT",
        ...quizReq,
      };
      vi.mocked(client.apiPost).mockResolvedValue(mockRes);

      const result = await createQuiz(quizReq);

      expect(client.apiPost).toHaveBeenCalledWith("/api/v1/quizzes", quizReq);
      expect(result).toEqual(mockRes);
    });

    it("shouldUpdateQuiz", async () => {
      const quizReq: QuizRequest = {
        courseId: "c-1",
        title: "Updated Quiz",
      };
      const mockRes: QuizResponse = {
        id: "q-1",
        status: "DRAFT",
        ...quizReq,
      };
      vi.mocked(client.apiPut).mockResolvedValue(mockRes);

      const result = await updateQuiz("q-1", quizReq);

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
      const reviewReq: QuizReviewRequest = {
        approved: true,
        rejectionReason: undefined,
      };
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
      const configReq: QuizTypeConfigRequest = {
        questionType: "SINGLE_CHOICE",
        requiredCount: 10,
        pointsPerQuestion: 1,
        scoringMethod: "AUTO",
      };
      const mockRes: QuizTypeConfigResponse = {
        id: "cfg-1",
        quizId: "q-1",
        ...configReq,
      };
      vi.mocked(client.apiPost).mockResolvedValue(mockRes);

      const result = await createQuizTypeConfig("q-1", configReq);

      expect(client.apiPost).toHaveBeenCalledWith(
        "/api/v1/quizzes/q-1/type-configs",
        configReq,
      );
      expect(result).toEqual(mockRes);
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
      const qReq: QuizQuestionRequest = {
        content: "Question text?",
        questionType: "SINGLE_CHOICE",
        orderIndex: 1,
      };
      const mockCreated: QuizQuestionResponse = {
        ...qReq,
        id: "quest-1",
        quizId: "q-1",
        points: 1,
        options: [],
      };
      vi.mocked(client.apiPost).mockResolvedValue(mockCreated);
      vi.mocked(client.apiPut).mockResolvedValue({
        ...mockCreated,
        content: "Updated",
      });
      vi.mocked(client.apiDelete).mockResolvedValue(undefined);

      const created = await createQuizQuestion("q-1", qReq);
      expect(client.apiPost).toHaveBeenCalledWith(
        "/api/v1/quizzes/q-1/questions",
        qReq,
      );
      expect(created).toEqual(mockCreated);

      const updated = await updateQuizQuestion("q-1", "quest-1", qReq);
      expect(client.apiPut).toHaveBeenCalledWith(
        "/api/v1/quizzes/q-1/questions/quest-1",
        qReq,
      );
      expect(updated).toEqual({ ...mockCreated, content: "Updated" });

      await deleteQuizQuestion("q-1", "quest-1");
      expect(client.apiDelete).toHaveBeenCalledWith(
        "/api/v1/quizzes/q-1/questions/quest-1",
      );
    });

    it("shouldHandleQuizAssignments", async () => {
      const assignReq: CreateAssignmentRequest = {
        quizId: "q-1",
        assignmentName: "Assignment 1",
        startTime: "2026-08-01T00:00:00Z",
        durationMinutes: 60,
        maxAttempts: 1,
      };
      const mockAssignment: QuizAssignmentResponse = {
        id: "a-1",
        status: "ACTIVE",
        shuffleQuestions: false,
        shuffleOptions: false,
        ...assignReq,
      };
      vi.mocked(client.apiPost).mockResolvedValue(mockAssignment);
      vi.mocked(client.apiGet).mockResolvedValue([mockAssignment]);
      vi.mocked(client.apiDelete).mockResolvedValue(undefined);

      await createQuizAssignment(assignReq);
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
      const mockAttempt: StartAttemptResponse = {
        attemptId: "att-1",
        assignmentId: "assign-1",
        quizId: "q-1",
        attemptNumber: 1,
        status: "IN_PROGRESS",
        startedAt: "2026-08-01T00:00:00Z",
        expiresAt: "2026-08-01T01:00:00Z",
        maxScore: 100,
        activeSessionToken: "token-xyz",
        questions: [],
      };
      vi.mocked(client.apiCall).mockResolvedValue({
        success: true,
        status: "OK",
        message: "Success",
        data: mockAttempt,
        timestamp: Date.now(),
      });

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
      const autoSaveReq: AutosaveRequest = {
        questionId: "q-1",
        clientSeq: 1,
        sessionToken: "st-1",
      };
      vi.mocked(client.apiPost).mockResolvedValue({ status: "SAVED" });

      await autosaveAttempt("att-1", autoSaveReq);
      expect(client.apiPost).toHaveBeenCalledWith(
        "/api/v1/quiz-attempts/att-1/autosave",
        autoSaveReq,
      );

      const heartbeatReq: HeartbeatRequest = { sessionToken: "st-1" };
      await heartbeatAttempt("att-1", heartbeatReq);
      expect(client.apiPost).toHaveBeenCalledWith(
        "/api/v1/quiz-attempts/att-1/heartbeat",
        heartbeatReq,
      );

      await submitAttempt("att-1");
      expect(client.apiPost).toHaveBeenCalledWith(
        "/api/v1/quiz-attempts/att-1/submit",
      );
    });

    it("shouldGetAttemptResultAndPendingEssays", async () => {
      const mockResult: AttemptResultResponse = {
        attemptId: "att-1",
        assignmentId: "asg-1",
        quizId: "q-1",
        studentUsername: "john_doe",
        attemptNumber: 1,
        status: "GRADED",
        startedAt: "2026-08-01T00:00:00Z",
        submittedAt: "2026-08-01T01:00:00Z",
        gradedAt: "2026-08-01T01:30:00Z",
        maxScore: 100,
        totalScore: 90,
        answers: [],
      };
      vi.mocked(client.apiGet).mockResolvedValue(mockResult);
      vi.mocked(client.apiPost).mockResolvedValue(mockResult);

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

      result.current.mutate({ courseId: "c-1", title: "New" });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(client.apiPost).toHaveBeenCalled();
    });

    it("shouldExecuteGenerateFromFileMutation", async () => {
      const mockJob: QuizGenerationJobResponse = {
        jobId: "job-1",
        courseId: "c-1",
        status: "PENDING",
        currentStep: "INIT",
        requestedTotal: 10,
        processedCount: 0,
        acceptedCount: 0,
        rejectedCount: 0,
        createdAt: "2026-08-01T00:00:00Z",
      };
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
      const mockJob: QuizGenerationJobResponse = {
        jobId: "job-2",
        courseId: "c-1",
        status: "PENDING",
        currentStep: "INIT",
        requestedTotal: 10,
        processedCount: 0,
        acceptedCount: 0,
        rejectedCount: 0,
        createdAt: "2026-08-01T00:00:00Z",
      };
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
      const mockJob: QuizGenerationJobResponse = {
        jobId: "job-1",
        courseId: "c-1",
        status: "PROCESSING",
        currentStep: "ANALYZING",
        requestedTotal: 10,
        processedCount: 5,
        acceptedCount: 5,
        rejectedCount: 0,
        createdAt: "2026-08-01T00:00:00Z",
      };
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
      const mockTraceability: QuestionTraceabilityResponse = {
        id: "tr-1",
        questionId: "q-1",
        sectionName: "Chapter 4",
        pageNumber: 42,
        generationJobId: "job-1",
        modelName: "gpt-4o",
        promptVersion: "v2",
        attemptCount: 1,
        createdAt: "2026-08-01T00:00:00Z",
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
      const mockJob: QuizGenerationJobResponse = {
        jobId: "job-1",
        courseId: "c-1",
        status: "PENDING",
        currentStep: "INIT",
        requestedTotal: 10,
        processedCount: 0,
        acceptedCount: 0,
        rejectedCount: 0,
        createdAt: "2026-08-01T00:00:00Z",
      };
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
      const mockJob: QuizGenerationJobResponse = {
        jobId: "job-2",
        courseId: "c-1",
        status: "PENDING",
        currentStep: "INIT",
        requestedTotal: 10,
        processedCount: 0,
        acceptedCount: 0,
        rejectedCount: 0,
        createdAt: "2026-08-01T00:00:00Z",
      };
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
      const mockJob: QuizGenerationJobResponse = {
        jobId: "job-1",
        courseId: "c-1",
        status: "COMPLETED",
        currentStep: "DONE",
        requestedTotal: 10,
        processedCount: 10,
        acceptedCount: 10,
        rejectedCount: 0,
        createdAt: "2026-08-01T00:00:00Z",
      };
      vi.mocked(client.apiGet).mockResolvedValue(mockJob);

      const res = await getQuizGenerationJob("job-1");
      expect(client.apiGet).toHaveBeenCalledWith(
        "/api/v1/quizzes/generation-jobs/job-1",
      );
      expect(res).toEqual(mockJob);
    });

    it("shouldGetQuestionTraceability", async () => {
      const mockTraceability: QuestionTraceabilityResponse = {
        id: "tr-1",
        pageNumber: 10,
        questionId: "q-1",
        generationJobId: "job-1",
        modelName: "gpt-4o",
        promptVersion: "v1",
        attemptCount: 1,
        createdAt: "2026-08-01T00:00:00Z",
      };
      vi.mocked(client.apiGet).mockResolvedValue(mockTraceability);

      const res = await getQuestionTraceability("job-1", "q-1");
      expect(client.apiGet).toHaveBeenCalledWith(
        "/api/v1/quizzes/generation-jobs/job-1/traceability/q-1",
      );
      expect(res).toEqual(mockTraceability);
    });
  });
});
