// --- Assignment ---

import { SubmissionLogStatus } from "./enum";

export type AssignmentResponse = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  fileObjectKey: string | null;
  submittedAt: string | null;
};

export type AssignmentRequest = {
  lectureId: string;
  title: string;
  description: string;
};

// --- Submission ---

export type SubmissionResponse = {
  id: string;
  studentUsername: string;
  fileObjectKey: string;
  submittedAt: string;
  fileName: string;
  contentType: string;
  fileSize: number;
};

export type SubmissionRequest = {
  assignmentId: string;
  fileObjectKey: string;
};

// --- Submission Log ---

export type SubmissionLogResponse = {
  id: string;
  status: SubmissionLogStatus;
  details: string;
  updatedAt: string;
};

// --- Feedback ---

export type FeedbackResponse = {
  id: string;
  feedback: string;
  lecturer: string;
  isMine: boolean;
  createdAt: string;
};

export type FeedbackRequest = {
  assignmentId: string;
  studentUsername: string;
  feedback: string;
};
