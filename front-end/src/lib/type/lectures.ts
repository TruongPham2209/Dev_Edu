// --- Lecture ---

export type LectureResponse = {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  videoObjectKey: string | null;
  duration: number;
  uploadedAt: string;
  isCompleted: boolean | null;
};

export type LectureRequest = {
  id?: string | null;
  courseId: string;
  title: string;
  summary: string;
  content?: string;
  videoObjectKey?: string | null;
};

// --- Material ---

export type MaterialResponse = {
  id: string;
  title: string;
  fileObjectKey: string;
  fileOriginalName: string | null;
  uploadedAt: string;
};

export type MaterialRequest = {
  lectureId: string;
  title: string;
  fileObjectKey: string;
};

// --- Progress ---

export type ProgressSegmentRequest = {
  lectureId: string;
  segmentStart: number;
  segmentEnd: number;
};

export type ProgressResponse = {
  lectureId: string;
  completed: boolean;
};

// --- Lecture Comments ---

export type CommentPageRequest = {
  lectureId: string;
  parentCommentId?: string | null;
  page?: number;
  size?: number;
  nextCursor?: string;
};

export type LectureCommentResponse = {
  id: string;
  rootCommentId: string | null;
  parentCommentId: string | null;
  content: string | null;
  createdAt: string;
  isDeleted: boolean;
  isMine: boolean;
  depth: number;
  replyCount: number;
};
