import { apiDelete, apiGet, apiPost } from "./client";
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
