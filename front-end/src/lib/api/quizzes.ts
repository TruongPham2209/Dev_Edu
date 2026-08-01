import type {
  AttemptResultResponse,
  AutosaveRequest,
  AutosaveResponse,
  CreateAssignmentRequest,
  GradeEssayRequest,
  HeartbeatRequest,
  PendingGradingResponse,
  QuizAssignmentResponse,
  QuizDetailResponse,
  QuizQuestionRequest,
  QuizQuestionResponse,
  QuizRequest,
  QuizResponse,
  QuizReviewRequest,
  QuizStatus,
  QuizTypeConfigRequest,
  QuizTypeConfigResponse,
  StartAttemptResponse,
  SubmitAttemptResponse,
} from "@/lib/type/quizzes";
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { CustomPaging } from "../type/api";
import { apiCall, apiDelete, apiGet, apiPost, apiPut } from "./client";

// ============================================================================
// --- Pure Async API Functions ---
// ============================================================================

// --- Lecturer & Admin Quiz Management APIs ---

export async function getQuizzesByCourse(
  courseId: string,
  status: QuizStatus,
  nextCursor?: string,
): Promise<CustomPaging<QuizResponse>> {
  const params = new URLSearchParams();
  params.append("status", status);
  if (nextCursor) params.append("nextCursor", nextCursor);

  return apiGet<CustomPaging<QuizResponse>>(
    `/api/v1/quizzes/course/${courseId}?${params.toString()}`,
  );
}

export async function getQuizById(quizId: string): Promise<QuizDetailResponse> {
  return apiGet<QuizDetailResponse>(`/api/v1/quizzes/${quizId}`);
}

export async function createQuiz(data: QuizRequest): Promise<QuizResponse> {
  return apiPost<QuizResponse>("/api/v1/quizzes", data);
}

export async function updateQuiz(
  quizId: string,
  data: QuizRequest,
): Promise<QuizResponse> {
  return apiPut<QuizResponse>(`/api/v1/quizzes/${quizId}`, data);
}

// --- Quiz Approval APIs ---

export async function submitQuizForApproval(
  quizId: string,
): Promise<QuizResponse> {
  return apiPost<QuizResponse>(`/api/v1/quizzes/${quizId}/submit`);
}

export async function getQuizzes(
  status: QuizStatus,
  nextCursor?: string,
): Promise<CustomPaging<QuizResponse>> {
  const params = new URLSearchParams();
  params.append("status", status);
  if (nextCursor) params.append("nextCursor", nextCursor);

  return apiGet<CustomPaging<QuizResponse>>(
    `/api/v1/quizzes?${params.toString()}`,
  );
}

export async function reviewQuiz(
  quizId: string,
  review: QuizReviewRequest,
): Promise<QuizResponse> {
  return apiPost<QuizResponse>(`/api/v1/quizzes/${quizId}/review`, review);
}

// --- Matrix Type Config APIs ---

export async function createQuizTypeConfig(
  quizId: string,
  config: QuizTypeConfigRequest,
): Promise<QuizTypeConfigResponse> {
  return apiPost<QuizTypeConfigResponse>(
    `/api/v1/quizzes/${quizId}/type-configs`,
    config,
  );
}

export async function getQuizTypeConfigs(
  quizId: string,
): Promise<QuizTypeConfigResponse[]> {
  return apiGet<QuizTypeConfigResponse[]>(
    `/api/v1/quizzes/${quizId}/type-configs`,
  );
}

export async function deleteQuizTypeConfig(
  quizId: string,
  configId: string,
): Promise<void> {
  return apiDelete<void>(`/api/v1/quizzes/${quizId}/type-configs/${configId}`);
}

// --- Question & Option APIs ---

export async function createQuizQuestion(
  quizId: string,
  question: QuizQuestionRequest,
): Promise<QuizQuestionResponse> {
  return apiPost<QuizQuestionResponse>(
    `/api/v1/quizzes/${quizId}/questions`,
    question,
  );
}

export async function updateQuizQuestion(
  quizId: string,
  questionId: string,
  question: QuizQuestionRequest,
): Promise<QuizQuestionResponse> {
  return apiPut<QuizQuestionResponse>(
    `/api/v1/quizzes/${quizId}/questions/${questionId}`,
    question,
  );
}

export async function deleteQuizQuestion(
  quizId: string,
  questionId: string,
): Promise<void> {
  return apiDelete<void>(`/api/v1/quizzes/${quizId}/questions/${questionId}`);
}

// --- Quiz Assignment APIs ---

export async function createQuizAssignment(
  data: CreateAssignmentRequest,
): Promise<QuizAssignmentResponse> {
  return apiPost<QuizAssignmentResponse>("/api/v1/quiz-assignments", data);
}

export async function getQuizAssignmentsByCourse(
  courseId: string,
): Promise<QuizAssignmentResponse[]> {
  const params = new URLSearchParams();
  params.append("courseId", courseId);
  return apiGet<QuizAssignmentResponse[]>(
    `/api/v1/quiz-assignments?${params.toString()}`,
  );
}

export async function getQuizAssignmentsByQuiz(
  quizId: string,
): Promise<QuizAssignmentResponse[]> {
  return apiGet<QuizAssignmentResponse[]>(
    `/api/v1/quiz-assignments/quiz/${quizId}`,
  );
}

export async function getAssignmentById(
  assignmentId: string,
): Promise<QuizAssignmentResponse> {
  return apiGet<QuizAssignmentResponse>(
    `/api/v1/quiz-assignments/${assignmentId}`,
  );
}

export async function deleteQuizAssignment(
  assignmentId: string,
): Promise<void> {
  return apiDelete<void>(`/api/v1/quiz-assignments/${assignmentId}`);
}

// --- Student Attempt & Exam APIs ---

export async function startAttempt(
  assignmentId: string,
  sessionToken: string,
): Promise<StartAttemptResponse> {
  let endpoint = `/api/v1/quiz-assignments/${assignmentId}/start`;

  if (sessionToken) {
    endpoint += `?sessionToken=${sessionToken}`;
  }

  const response = await apiCall<StartAttemptResponse>(endpoint, {
    method: "POST",
    headers: {
      "X-Session-Token": sessionToken,
    },
  });
  return response.data;
}

export async function autosaveAttempt(
  attemptId: string,
  data: AutosaveRequest,
): Promise<AutosaveResponse> {
  return apiPost<AutosaveResponse>(
    `/api/v1/quiz-attempts/${attemptId}/autosave`,
    data,
  );
}

export async function heartbeatAttempt(
  attemptId: string,
  data: HeartbeatRequest,
): Promise<void> {
  return apiPost<void>(`/api/v1/quiz-attempts/${attemptId}/heartbeat`, data);
}

export async function submitAttempt(
  attemptId: string,
): Promise<SubmitAttemptResponse> {
  return apiPost<SubmitAttemptResponse>(
    `/api/v1/quiz-attempts/${attemptId}/submit`,
  );
}

export async function getAttemptResult(
  attemptId: string,
): Promise<AttemptResultResponse> {
  return apiGet<AttemptResultResponse>(
    `/api/v1/quiz-attempts/${attemptId}/result`,
  );
}

// --- Essay Grading APIs ---

export async function getPendingGradings(
  quizId: string,
  nextCursor?: string,
): Promise<CustomPaging<PendingGradingResponse>> {
  const params = new URLSearchParams();
  if (nextCursor) params.append("nextCursor", nextCursor);

  return apiGet<CustomPaging<PendingGradingResponse>>(
    `/api/v1/quiz-gradings/${quizId}/pending${params.toString() ? `?${params.toString()}` : ""}`,
  );
}

export async function gradeEssayQuestion(
  attemptId: string,
  questionId: string,
  data: GradeEssayRequest,
): Promise<AttemptResultResponse> {
  return apiPost<AttemptResultResponse>(
    `/api/v1/quiz-gradings/attempts/${attemptId}/questions/${questionId}`,
    data,
  );
}

// ============================================================================
// --- React Query Hooks ---
// ============================================================================

// --- Lecturer & Admin Quiz Management Hooks ---

export function useQuizzesByCourseInfiniteQuery(
  courseId: string,
  status: QuizStatus,
  options?: Omit<
    UseInfiniteQueryOptions<
      CustomPaging<QuizResponse>,
      Error,
      InfiniteData<CustomPaging<QuizResponse>, string | undefined>,
      readonly unknown[],
      string | undefined
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) {
  return useInfiniteQuery({
    queryKey: ["quizzes", "course", courseId, status],
    queryFn: ({ pageParam }) => getQuizzesByCourse(courseId, status, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!courseId,
    ...options,
  });
}

export function useQuizzesByCourseQuery(
  courseId: string,
  status: QuizStatus,
  nextCursor?: string,
  options?: Omit<
    UseQueryOptions<CustomPaging<QuizResponse>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["quizzes", "course", courseId, status, nextCursor],
    queryFn: () => getQuizzesByCourse(courseId, status, nextCursor),
    enabled: !!courseId,
    ...options,
  });
}

export function useQuizByIdQuery(
  quizId: string,
  options?: Omit<
    UseQueryOptions<QuizDetailResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["quizzes", "detail", quizId],
    queryFn: () => getQuizById(quizId),
    enabled: !!quizId,
    ...options,
  });
}

export function useCreateQuizMutation(
  options?: UseMutationOptions<QuizResponse, Error, QuizRequest>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createQuiz,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useUpdateQuizMutation(
  options?: UseMutationOptions<
    QuizResponse,
    Error,
    { quizId: string; data: QuizRequest }
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, data }) => updateQuiz(quizId, data),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      options?.onSuccess?.(...args);
    },
  });
}

// --- Quiz Approval Hooks ---

export function useSubmitQuizForApprovalMutation(
  options?: UseMutationOptions<QuizResponse, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quizId: string) => submitQuizForApproval(quizId),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useSubmitQuizMutation(
  options?: UseMutationOptions<QuizResponse, Error, string>,
) {
  return useSubmitQuizForApprovalMutation(options);
}

export function useQuizzesInfiniteQuery(
  status: QuizStatus,
  options?: Omit<
    UseInfiniteQueryOptions<
      CustomPaging<QuizResponse>,
      Error,
      InfiniteData<CustomPaging<QuizResponse>, string | undefined>,
      readonly unknown[],
      string | undefined
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) {
  return useInfiniteQuery({
    queryKey: ["quizzes", "status-infinite", status],
    queryFn: ({ pageParam }) => getQuizzes(status, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!status,
    ...options,
  });
}

export function useQuizzesQuery(
  status: QuizStatus,
  nextCursor?: string,
  options?: Omit<
    UseQueryOptions<CustomPaging<QuizResponse>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["quizzes", "status", status, nextCursor],
    queryFn: () => getQuizzes(status, nextCursor),
    enabled: !!status,
    ...options,
  });
}

export function useReviewQuizMutation(
  options?: UseMutationOptions<
    QuizResponse,
    Error,
    { quizId: string; review: QuizReviewRequest }
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, review }) => reviewQuiz(quizId, review),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      options?.onSuccess?.(...args);
    },
  });
}

// --- Matrix Type Config Hooks ---

export function useQuizTypeConfigsQuery(
  quizId: string,
  options?: Omit<
    UseQueryOptions<QuizTypeConfigResponse[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["quizzes", quizId, "type-configs"],
    queryFn: () => getQuizTypeConfigs(quizId),
    enabled: !!quizId,
    ...options,
  });
}

export function useCreateQuizTypeConfigMutation(
  options?: UseMutationOptions<
    QuizTypeConfigResponse,
    Error,
    { quizId: string; config: QuizTypeConfigRequest }
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, config }) => createQuizTypeConfig(quizId, config),
    ...options,
    onSuccess: (...args) => {
      const variables = args[1];
      queryClient.invalidateQueries({
        queryKey: ["quizzes", variables.quizId, "type-configs"],
      });
      options?.onSuccess?.(...args);
    },
  });
}

export function useDeleteQuizTypeConfigMutation(
  options?: UseMutationOptions<
    void,
    Error,
    { quizId: string; configId: string }
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, configId }) =>
      deleteQuizTypeConfig(quizId, configId),
    ...options,
    onSuccess: (...args) => {
      const variables = args[1];
      queryClient.invalidateQueries({
        queryKey: ["quizzes", variables.quizId, "type-configs"],
      });
      options?.onSuccess?.(...args);
    },
  });
}

// --- Question & Option Hooks ---

export function useCreateQuizQuestionMutation(
  options?: UseMutationOptions<
    QuizQuestionResponse,
    Error,
    { quizId: string; question: QuizQuestionRequest }
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, question }) => createQuizQuestion(quizId, question),
    ...options,
    onSuccess: (...args) => {
      const variables = args[1];
      queryClient.invalidateQueries({
        queryKey: ["quizzes", "detail", variables.quizId],
      });
      options?.onSuccess?.(...args);
    },
  });
}

export function useUpdateQuizQuestionMutation(
  options?: UseMutationOptions<
    QuizQuestionResponse,
    Error,
    { quizId: string; questionId: string; question: QuizQuestionRequest }
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, questionId, question }) =>
      updateQuizQuestion(quizId, questionId, question),
    ...options,
    onSuccess: (...args) => {
      const variables = args[1];
      queryClient.invalidateQueries({
        queryKey: ["quizzes", "detail", variables.quizId],
      });
      options?.onSuccess?.(...args);
    },
  });
}

export function useDeleteQuizQuestionMutation(
  options?: UseMutationOptions<
    void,
    Error,
    { quizId: string; questionId: string }
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, questionId }) =>
      deleteQuizQuestion(quizId, questionId),
    ...options,
    onSuccess: (...args) => {
      const variables = args[1];
      queryClient.invalidateQueries({
        queryKey: ["quizzes", "detail", variables.quizId],
      });
      options?.onSuccess?.(...args);
    },
  });
}

// --- Quiz Assignment Hooks ---

export function useCreateQuizAssignmentMutation(
  options?: UseMutationOptions<
    QuizAssignmentResponse,
    Error,
    CreateAssignmentRequest
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createQuizAssignment,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["quiz-assignments"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useQuizAssignmentsByCourseQuery(
  courseId: string,
  options?: Omit<
    UseQueryOptions<QuizAssignmentResponse[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["quiz-assignments", "course", courseId],
    queryFn: () => getQuizAssignmentsByCourse(courseId),
    enabled: !!courseId,
    ...options,
  });
}

export function useQuizAssignmentsByQuizQuery(
  quizId: string,
  options?: Omit<
    UseQueryOptions<QuizAssignmentResponse[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["quiz-assignments", "quiz", quizId],
    queryFn: () => getQuizAssignmentsByQuiz(quizId),
    enabled: !!quizId,
    ...options,
  });
}

export function useQuizAssignmentsQuery(
  courseId?: string,
  quizId?: string,
  options?: Omit<
    UseQueryOptions<QuizAssignmentResponse[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["quiz-assignments", "list", courseId, quizId],
    queryFn: () => {
      if (quizId) return getQuizAssignmentsByQuiz(quizId);
      if (courseId) return getQuizAssignmentsByCourse(courseId);
      return Promise.resolve([]);
    },
    enabled: !!quizId || !!courseId,
    ...options,
  });
}

export function useAssignmentByIdQuery(
  assignmentId: string,
  options?: Omit<
    UseQueryOptions<QuizAssignmentResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["quiz-assignments", "detail", assignmentId],
    queryFn: () => getAssignmentById(assignmentId),
    enabled: !!assignmentId,
    ...options,
  });
}

export function useDeleteQuizAssignmentMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: string) => deleteQuizAssignment(assignmentId),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["quiz-assignments"] });
      options?.onSuccess?.(...args);
    },
  });
}

// --- Student Attempt & Exam Hooks ---

export function useStartAttemptMutation(
  options?: UseMutationOptions<
    StartAttemptResponse,
    Error,
    { assignmentId: string; sessionToken: string }
  >,
) {
  return useMutation({
    mutationFn: ({ assignmentId, sessionToken }) =>
      startAttempt(assignmentId, sessionToken),
    ...options,
  });
}

export function useAutosaveAttemptMutation(
  options?: UseMutationOptions<
    AutosaveResponse,
    Error,
    { attemptId: string; data: AutosaveRequest }
  >,
) {
  return useMutation({
    mutationFn: ({ attemptId, data }) => autosaveAttempt(attemptId, data),
    ...options,
  });
}

export function useHeartbeatAttemptMutation(
  options?: UseMutationOptions<
    void,
    Error,
    { attemptId: string; data: HeartbeatRequest }
  >,
) {
  return useMutation({
    mutationFn: ({ attemptId, data }) => heartbeatAttempt(attemptId, data),
    ...options,
  });
}

export function useSubmitAttemptMutation(
  options?: UseMutationOptions<SubmitAttemptResponse, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attemptId: string) => submitAttempt(attemptId),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useAttemptResultQuery(
  attemptId: string,
  options?: Omit<
    UseQueryOptions<AttemptResultResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["quiz-attempts", "result", attemptId],
    queryFn: () => getAttemptResult(attemptId),
    enabled: !!attemptId,
    ...options,
  });
}

// --- Essay Grading Hooks ---

export function usePendingGradingsInfiniteQuery(
  quizId: string,
  options?: Omit<
    UseInfiniteQueryOptions<
      CustomPaging<PendingGradingResponse>,
      Error,
      InfiniteData<CustomPaging<PendingGradingResponse>, string | undefined>,
      readonly unknown[],
      string | undefined
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) {
  return useInfiniteQuery({
    queryKey: ["quiz-gradings", "pending-infinite", quizId],
    queryFn: ({ pageParam }) => getPendingGradings(quizId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!quizId,
    ...options,
  });
}

export function usePendingGradingsQuery(
  quizId?: string,
  nextCursor?: string,
  options?: Omit<
    UseQueryOptions<CustomPaging<PendingGradingResponse>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["quiz-gradings", "pending", quizId, nextCursor],
    queryFn: () => getPendingGradings(quizId!, nextCursor),
    enabled: !!quizId,
    ...options,
  });
}

export function useGradeEssayQuestionMutation(
  options?: UseMutationOptions<
    AttemptResultResponse,
    Error,
    { attemptId: string; questionId: string; data: GradeEssayRequest }
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attemptId, questionId, data }) =>
      gradeEssayQuestion(attemptId, questionId, data),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["quiz-gradings"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useGradeEssayMutation(
  options?: UseMutationOptions<
    AttemptResultResponse,
    Error,
    { attemptId: string; questionId: string; data: GradeEssayRequest }
  >,
) {
  return useGradeEssayQuestionMutation(options);
}
