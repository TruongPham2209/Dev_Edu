import type {
  AssignmentRequest,
  AssignmentResponse,
  FeedbackRequest,
  FeedbackResponse,
  SubmissionLogResponse,
  SubmissionRequest,
  SubmissionResponse,
} from "@/lib/type/assignments";
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
import { apiDelete, apiGet, apiPost } from "./client";

// --- Assignments ---

async function getAssignments(
  lectureId: string,
): Promise<AssignmentResponse[]> {
  return apiGet<AssignmentResponse[]>(
    `/api/v1/assignments?lectureId=${lectureId}`,
  );
}

async function getAssignmentById(
  assignmentId: string,
): Promise<AssignmentResponse> {
  return apiGet<AssignmentResponse>(
    `/api/v1/assignments?assignmentId=${assignmentId}`,
  );
}

async function createAssignment(
  assignment: AssignmentRequest,
): Promise<AssignmentResponse> {
  return apiPost<AssignmentResponse>("/api/v1/assignments", assignment);
}

async function deleteAssignment(assignmentId: string): Promise<void> {
  return apiDelete<void>(`/api/v1/assignments?assignmentId=${assignmentId}`);
}

// --- Submissions ---

async function getSubmissions(
  assignmentId: string,
  page: number = 0,
  size: number = 10,
): Promise<CustomPaging<SubmissionResponse>> {
  return apiGet<CustomPaging<SubmissionResponse>>(
    `/api/v1/assignments/submissions?assignmentId=${assignmentId}&page=${page}&size=${size}`,
  );
}

async function createSubmission(
  submission: SubmissionRequest,
): Promise<SubmissionResponse> {
  return apiPost<SubmissionResponse>(
    "/api/v1/assignments/submissions",
    submission,
  );
}

async function deleteSubmission(assignmentId: string): Promise<void> {
  return apiDelete<void>(
    `/api/v1/assignments/submissions?assignmentId=${assignmentId}`,
  );
}

// --- Submission Tracking ---

async function getSubmissionTracking(
  assignmentId: string,
  studentUsername?: string,
  page: number = 0,
): Promise<CustomPaging<SubmissionLogResponse>> {
  const query = new URLSearchParams();
  query.append("assignmentId", assignmentId);
  if (studentUsername) query.append("studentUsername", studentUsername);
  query.append("page", String(page));

  return apiGet<CustomPaging<SubmissionLogResponse>>(
    `/api/v1/assignments/submissions/tracking?${query.toString()}`,
  );
}

// --- Feedbacks ---

async function getFeedbacks(
  assignmentId: string,
  studentUsername?: string,
): Promise<FeedbackResponse[]> {
  const query = new URLSearchParams();
  query.append("assignmentId", assignmentId);
  if (studentUsername) query.append("studentUsername", studentUsername);

  return apiGet<FeedbackResponse[]>(
    `/api/v1/assignments/feedbacks?${query.toString()}`,
  );
}

async function createFeedback(
  feedback: FeedbackRequest,
): Promise<FeedbackResponse> {
  return apiPost<FeedbackResponse>("/api/v1/assignments/feedbacks", feedback);
}

async function deleteFeedback(feedbackId: string): Promise<void> {
  return apiDelete<void>(
    `/api/v1/assignments/feedbacks?feedbackId=${feedbackId}`,
  );
}

// --- React Query Hooks ---

export function useAssignmentsQuery(
  lectureId: string,
  options?: Omit<
    UseQueryOptions<AssignmentResponse[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["assignments", "lecture", lectureId],
    queryFn: () => getAssignments(lectureId),
    enabled: !!lectureId,
    ...options,
  });
}

export function useAssignmentByIdQuery(
  assignmentId: string,
  options?: Omit<
    UseQueryOptions<AssignmentResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["assignments", "detail", assignmentId],
    queryFn: () => getAssignmentById(assignmentId),
    enabled: !!assignmentId,
    ...options,
  });
}

export function useCreateAssignmentMutation(
  options?: UseMutationOptions<AssignmentResponse, Error, AssignmentRequest>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAssignment,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useDeleteAssignmentMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAssignment,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useSubmissionsInfiniteQuery(
  assignmentId: string,
  size: number = 10,
  options?: Omit<
    UseInfiniteQueryOptions<
      CustomPaging<SubmissionResponse>,
      Error,
      InfiniteData<CustomPaging<SubmissionResponse>, number>,
      readonly unknown[],
      number
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) {
  return useInfiniteQuery({
    queryKey: ["submissions", "infinite", assignmentId, size],
    queryFn: ({ pageParam }) => getSubmissions(assignmentId, pageParam, size),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages - 1
        ? lastPage.currentPage + 1
        : undefined,
    enabled: !!assignmentId,
    ...options,
  });
}

export function useCreateSubmissionMutation(
  options?: UseMutationOptions<SubmissionResponse, Error, SubmissionRequest>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSubmission,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useDeleteSubmissionMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSubmission,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useSubmissionTrackingQuery(
  assignmentId: string,
  studentUsername?: string,
  page: number = 0,
  options?: Omit<
    UseQueryOptions<CustomPaging<SubmissionLogResponse>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["submissions", "tracking", assignmentId, studentUsername, page],
    queryFn: () => getSubmissionTracking(assignmentId, studentUsername, page),
    enabled: !!assignmentId,
    ...options,
  });
}

export function useSubmissionTrackingInfiniteQuery(
  assignmentId: string,
  studentUsername?: string,
  options?: Omit<
    UseInfiniteQueryOptions<
      CustomPaging<SubmissionLogResponse>,
      Error,
      InfiniteData<CustomPaging<SubmissionLogResponse>>,
      unknown[],
      number
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) {
  return useInfiniteQuery({
    queryKey: [
      "submissions",
      "tracking",
      "infinite",
      assignmentId,
      studentUsername,
    ],
    queryFn: ({ pageParam }) =>
      getSubmissionTracking(assignmentId, studentUsername, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages - 1
        ? lastPage.currentPage + 1
        : undefined,
    enabled: !!assignmentId && !!studentUsername,
    ...options,
  });
}

export function useFeedbacksQuery(
  assignmentId: string,
  studentUsername?: string,
  options?: Omit<
    UseQueryOptions<FeedbackResponse[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["feedbacks", assignmentId, studentUsername],
    queryFn: () => getFeedbacks(assignmentId, studentUsername),
    enabled: !!assignmentId,
    ...options,
  });
}

export function useCreateFeedbackMutation(
  options?: UseMutationOptions<FeedbackResponse, Error, FeedbackRequest>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFeedback,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useDeleteFeedbackMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFeedback,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      options?.onSuccess?.(...args);
    },
  });
}
