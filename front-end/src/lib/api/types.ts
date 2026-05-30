// Types matching the backend API documentation exactly.
// All date/time fields are ISO-8601 strings (LocalDateTime / LocalDate).

// --- Enums ---

export type ItemStatus = "ACTIVE" | "DELETED" | "ALL";

export type RoleEnum = "STUDENT" | "LECTURER" | "ADMIN";

export type EntityType = "COURSE" | "SUBSCRIPTION";

export type PaymentMethod = "VNPAY" | "MOMO" | "ZALOPAY" | "PAYPAL" | "STRIPE";

export type PostStatus = "PENDING" | "SUPERSEDED" | "APPROVED" | "REJECTED";

export type SubmissionLogStatus = "SUBMITTED" | "UNSUBMITTED";

export type PaymentStatus = "COMPLETED" | "FAILED" | "CANCELLED";

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
  avatarUrl?: string;
  role: RoleEnum;
  courseCount?: number;
  postedPosts?: number;
};

// --- Category ---

export type CategoryResponse = {
  id: string;
  name: string;
  description: string;
  thumbnailObjectKey: string;
  thumbnailUrl: string;
  totalCourses: number;
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
  categoryId: string;

  title: string;
  thumbnailObjectKey: string;
  thumbnailUrl: string | null;
  description: string;
  createdAt: string;

  originalPrice: number | null;
  discountedPercentage: number | null;
  discountedPrice: number | null;
  validTo: string | null;

  avgReview: number;
  totalReview: number;
  totalEnrollment: number;

  lecturers: string[] | null;
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

// --- Forum Post ---

export type PostResponse = {
  id: string;
  title: string;
  authorUsername: string;
  authorFullName: string;
  authorAvatarUrl: string | null;
  thumbUrl: string | null;
  shortDescription: string;
  content: string;
  views: number;
  status?: PostStatus;
  comments: number;
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
  authorUsername: string;
  authorFullName: string;
  authorAvatarUrl: string | null;
  thumbUrl: string | null;
  title: string;
  shortDescription: string;
  savedAt: string;
};

export type UpdatedPostResponse = {
  affectedVersionIds: string[];
  newStatus: PostStatus;
  currentVersionId: string;
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

export type CourseItemDetailResponse = {
  id: string;

  courseId: string;
  title: string;
  description: string;
  thumbnailUrl: string;

  originalPrice?: number;
  discountedPrice: number;

  timestamp: string;
  status?: PaymentStatus;
};

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
  items: CourseItemResponse[] | null; // TODO: Update if implements subscription
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

export type CourseDiscountResponse = {
  id: string;
  courseId?: string | null;
  originalPrice?: number | null;
  courseTitle?: string | null;
  courseDescription?: string | null;
  courseThumbnailUrl?: string | null;
  discountDescription: string;
  discountPercentage: number;
  validFrom: string;
  validTo: string;
  createdBy: string;
  createdAt: string;
};

// --- File ---

export type FilePreSignUploadRequest = {
  fileName: string;
  contentType: string;
  fileSize: number;
  isPublic?: boolean;
};

export type FileUploadResponse = {
  originalFileName: string;
  contentType: string;
  fileSize?: number;
  uploadUrl?: string;
  objectKey: string;
  publicUrl?: string;
  downloadUrl?: string;
};

// --- User ---

export type RegisterUser = {
  username: string; // validate "^[a-zA-Z][a-zA-Z0-9]{2,31}$"
  email: string; // validate mail
  password: string; // validate "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
  fullName: string;
  role?: RoleEnum | null;
};

export type EnrollmentUserResponse = {
  id: string;
  username: string;
  fullName: string;
  enrolledAt: string | null;
};
