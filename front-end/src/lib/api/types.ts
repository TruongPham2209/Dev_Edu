// Types matching the backend API documentation exactly.
// All date/time fields are ISO-8601 strings (LocalDateTime / LocalDate).

// --- Enums ---

export type ItemStatus = "ACTIVE" | "DELETED" | "ALL";

export type RoleEnum = "STUDENT" | "LECTURER" | "ADMIN";

export type EntityType = "COURSE" | "SUBSCRIPTION";

export type PaymentMethod = "VNPAY" | "MOMO" | "ZALOPAY" | "PAYPAL" | "STRIPE";

export type PostStatus = "PENDING" | "SUPERSEDED" | "APPROVED" | "REJECTED";

export type SubmissionLogStatus = "SUBMITTED" | "UNSUBMITTED";

// --- Pagination ---

export type CustomPaging<T> = {
  contents: T[];
  totalPages: number;
  pageSize: number;
  totalElements: number;
  currentPage: number;
  nextCursor?: string | null;
};

// --- User ---
export type UserResponse = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: RoleEnum;
};

// --- Category ---

export type CategoryResponse = {
  id: string;
  name: string;
  description: string;
  thumbnailObjectKey: string;
  thumbnailUrl: string | null;
};

export type CategoryRequest = {
  id?: string | null;
  name: string;
  description: string;
  thumbnailObjectKey: string;
};

// --- Course ---

export type CourseResponse = {
  id: string;
  title: string;
  thumbnailObjectKey: string;
  thumbnailUrl: string | null;
  description: string;
  createdAt: string;
  originalPrice: number | null;
  discountedPercentage: number | null;
  discountedPrice: number | null;
  validTo: string | null;
  lecturers: string[] | null;
};

export type CourseDetailProjection = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  thumbnailObjectKey: string;
  originalPrice: number | null;
  discountedPercentage: number | null;
  validTo: string | null;
  createdBy: string;
  createdAt: string;
};

export type CourseRequest = {
  id?: string | null;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  thumbnailObjectKey: string;
  lecturerUsernames: string[];
};

// --- Review ---

export type ReviewResponse = {
  id: string;
  comment: string;
  rating: number;
  username: string;
  createdAt: string;
};

export type ReviewRequest = {
  courseId: string;
  content: string;
  rating: number;
};

// --- Lecture ---

export type LectureResponse = {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  videoObjectKey: string | null;
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

// --- Assignment ---

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
  createdAt: string;
};

export type FeedbackRequest = {
  submissionId: string;
  feedback: string;
};

// --- Forum Post ---

export type PostResponse = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type PostRequest = {
  postId?: string | null;
  thumbObjectKey: string;
  title: string;
  shortDescription: string;
  content: string;
};

export type SavedPostResponse = {
  id: string;
  postId: string;
  thumbUrl: string | null;
  title: string;
  shortDescription: string;
  savedAt: string;
};

// --- Post Version ---

export type PostVersionUpdateRequest = {
  postVersionId: string;
  postStatus: PostStatus;
};

// --- Forum Comment ---

export type ForumCommentResponse = {
  id: string;
  author: string;
  content: string | null;
  replyCount: number;
  repliedToCommentId: string | null;
  createdAt: string;
  isDeleted: boolean;
  isMine: boolean;
};

export type ForumCommentRequest = {
  postId: string;
  content: string;
  repliedToCommentId?: string;
};

// --- Enrollment / Payment / Cart ---

export type PurchaseRequest = {
  entityIds: string[];
  entityType: EntityType;
  paymentMethod: PaymentMethod;
  ipAddress?: string;
};

export type PurchaseDetailResponse = {
  paymentId: string;
  paymentUrl: string | null;
  totalAmount: number;
  entityType: string;
  items: unknown[] | null;
};

export type CourseItemResponse = {
  id: string;
  registered: boolean;
  originalPrice: number | null;
  discountedPrice: number | null;
  title: string;
  thumbnailUrl: string | null;
};

// --- Course Discount ---

export type CourseDiscountRequest = {
  courseId?: string | null;
  description: string;
  discountPercentage: number;
  validFrom: string;
  validTo: string;
};

// --- File ---

export type FilePreSignUploadRequest = {
  fileName: string;
  contentType: string;
  fileSize: number;
  isPublic?: boolean;
};

export type FileUploadResponse = {
  originalFileName: string | null;
  contentType: string | null;
  fileSize: number | null;
  uploadUrl: string;
  objectKey: string;
  publicUrl: string | null;
  downloadUrl: string | null;
};

// --- User ---

export type RegisterUser = {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role?: RoleEnum | null;
};
