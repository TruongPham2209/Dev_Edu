import { apiDelete, apiGet, apiPost } from "./client";
import { useQuery, useMutation, useInfiniteQuery, UseQueryOptions, UseMutationOptions, UseInfiniteQueryOptions, InfiniteData } from "@tanstack/react-query";
import type {
  AssignmentRequest,
  AssignmentResponse,
  CustomPaging,
  FeedbackRequest,
  FeedbackResponse,
  SubmissionLogResponse,
  SubmissionRequest,
  SubmissionResponse,
} from "./types";

// --- Assignments ---

export async function getAssignments(
  lectureId: string,
): Promise<AssignmentResponse[]> {
  return apiGet<AssignmentResponse[]>(
    `/api/v1/assignments?lectureId=${lectureId}`,
  );
}

export async function getAssignmentById(
  assignmentId: string,
): Promise<AssignmentResponse> {
  return apiGet<AssignmentResponse>(
    `/api/v1/assignments?assignmentId=${assignmentId}`,
  );
}

export async function createAssignment(
  assignment: AssignmentRequest,
): Promise<AssignmentResponse> {
  return apiPost<AssignmentResponse>("/api/v1/assignments", assignment);
}

export async function deleteAssignment(assignmentId: string): Promise<void> {
  return apiDelete<void>(`/api/v1/assignments?assignmentId=${assignmentId}`);
}

// --- Submissions ---

export async function getSubmissions(
  assignmentId: string,
  page: number = 0,
  size: number = 10,
): Promise<CustomPaging<SubmissionResponse>> {
  return apiGet<CustomPaging<SubmissionResponse>>(
    `/api/v1/assignments/submissions?assignmentId=${assignmentId}&page=${page}&size=${size}`,
  );
}

export async function createSubmission(
  submission: SubmissionRequest,
): Promise<SubmissionResponse> {
  return apiPost<SubmissionResponse>(
    "/api/v1/assignments/submissions",
    submission,
  );
}

/** Delete submission uses assignmentId per API docs */
export async function deleteSubmission(assignmentId: string): Promise<void> {
  return apiDelete<void>(
    `/api/v1/assignments/submissions?assignmentId=${assignmentId}`,
  );
}

// --- Submission Tracking ---

export async function getSubmissionTracking(
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

export async function getFeedbacks(
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

export async function createFeedback(
  feedback: FeedbackRequest,
): Promise<FeedbackResponse> {
  return apiPost<FeedbackResponse>("/api/v1/assignments/feedbacks", feedback);
}

export async function deleteFeedback(feedbackId: string): Promise<void> {
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
  return useMutation({
    mutationFn: createAssignment,
    ...options,
  });
}

export function useDeleteAssignmentMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  return useMutation({
    mutationFn: deleteAssignment,
    ...options,
  });
}

export function useSubmissionsQuery(
  assignmentId: string,
  page: number = 0,
  size: number = 10,
  options?: Omit<
    UseQueryOptions<CustomPaging<SubmissionResponse>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["submissions", assignmentId, page, size],
    queryFn: () => getSubmissions(assignmentId, page, size),
    enabled: !!assignmentId,
    ...options,
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
  return useMutation({
    mutationFn: createSubmission,
    ...options,
  });
}

export function useDeleteSubmissionMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  return useMutation({
    mutationFn: deleteSubmission,
    ...options,
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
  return useMutation({
    mutationFn: createFeedback,
    ...options,
  });
}

export function useDeleteFeedbackMutation(
  options?: UseMutationOptions<void, Error, string>,
) {
  return useMutation({
    mutationFn: deleteFeedback,
    ...options,
  });
}

// Aliases for backward compatibility during refactoring
export {
  useAssignmentsQuery as useGetAssignments,
  useSubmissionsQuery as useGetSubmissions,
  useFeedbacksQuery as useGetFeedbacks,
};

