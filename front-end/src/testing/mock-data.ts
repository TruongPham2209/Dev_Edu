import type { AssignmentResponse, SubmissionResponse } from "@/lib/type/assignments";
import type {
  CategoryResponse,
  CourseDiscountResponse,
  CourseResponse,
  ReviewResponse,
} from "@/lib/type/courses";
import type { GlobalDocumentResponse } from "@/lib/type/documents";
import type {
  ForumCommentResponse,
  PostResponse,
  SavedPostResponse,
} from "@/lib/type/forums";
import type {
  LectureCommentResponse,
  LectureResponse,
  MaterialResponse,
} from "@/lib/type/lectures";
import type {
  DashboardOverviewResponse
} from "@/lib/type/metrics";
import type { NotificationResponse } from "@/lib/type/notification";
import type {
  QuizQuestionResponse,
  QuizResponse
} from "@/lib/type/quizzes";
import type { UserResponse, EnrollmentUserResponse } from "@/lib/type/users";
import type { AuthRole, AuthUser } from "@/lib/auth-storage";
import type { AuthStatus } from "@/lib/use-auth";
import type { ToastContextType } from "@/lib/toast-context";
import { vi } from "vitest";

export function createMockAuthUser(
  overrides?: Partial<AuthUser>,
): AuthUser {
  return {
    id: "user-1",
    username: "john_doe",
    fullName: "John Doe",
    role: "STUDENT",
    roles: ["STUDENT"],
    email: "john@example.com",
    avatarObjectKey: "avatars/john.jpg",
    avatarUrl: "https://example.com/avatars/john.jpg",
    ...overrides,
  };
}

export function createMockAuthStatus(
  overrides?: Partial<AuthStatus>,
): AuthStatus {
  const user =
    overrides?.user !== undefined ? overrides.user : createMockAuthUser();
  return {
    isAuthenticated: user !== null,
    role: user?.role ?? null,
    roles: user?.roles ?? (user?.role ? [user.role] : []),
    user,
    ...overrides,
  };
}

export function createMockToast(): ToastContextType {
  return {
    show: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  };
}

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function createMockRouter(
  overrides?: Partial<AppRouterInstance>,
): AppRouterInstance {
  return {
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    ...overrides,
  };
}

export class MockReadonlyURLSearchParams extends URLSearchParams {
  override append(): void {
    throw new Error("ReadonlyURLSearchParams cannot be mutated");
  }
  override delete(): void {
    throw new Error("ReadonlyURLSearchParams cannot be mutated");
  }
  override set(): void {
    throw new Error("ReadonlyURLSearchParams cannot be mutated");
  }
  override sort(): void {
    throw new Error("ReadonlyURLSearchParams cannot be mutated");
  }
}

export function createMockSearchParams(
  init: string | Record<string, string> | URLSearchParams = "",
): MockReadonlyURLSearchParams {
  const params =
    typeof init === "string"
      ? new URLSearchParams(init)
      : new URLSearchParams(init as Record<string, string>);
  return new MockReadonlyURLSearchParams(params);
}

export function createMockCategory(
  overrides?: Partial<CategoryResponse>,
): CategoryResponse {
  return {
    id: "cat-1",
    name: "Web Development",
    description: "Learn full-stack development",
    thumbnailObjectKey: "cat-thumb.jpg",
    thumbnailUrl: "https://example.com/cat-thumb.jpg",
    totalCourses: 10,
    ...overrides,
  };
}

export function createMockCourse(
  overrides?: Partial<CourseResponse>,
): CourseResponse {
  return {
    id: "course-1",
    categoryId: "cat-1",
    title: "Mastering Next.js & Spring Boot",
    thumbnailObjectKey: "course-thumb.jpg",
    thumbnailUrl: "https://example.com/course-thumb.jpg",
    description: "Complete hands-on course",
    createdAt: "2026-01-01T00:00:00Z",
    originalPrice: 100,
    discountedPercentage: 20,
    discountedPrice: 80,
    validTo: "2026-12-31T23:59:59Z",
    registered: false,
    avgReview: 4.8,
    totalReview: 25,
    totalEnrollment: 150,
    lecturers: ["john_doe"],
    ...overrides,
  };
}

export function createMockUser(
  overrides?: Partial<UserResponse>,
): UserResponse {
  return {
    id: "user-1",
    username: "john_doe",
    email: "john@example.com",
    fullName: "John Doe",
    role: "STUDENT",
    avatarUrl: "https://example.com/avatar.jpg",
    courseCount: 3,
    postedPosts: 5,
    ...overrides,
  };
}

export function createMockEnrollmentUser(
  overrides?: Partial<EnrollmentUserResponse>,
): EnrollmentUserResponse {
  return {
    id: "enroll-1",
    username: "student_1",
    fullName: "Student One",
    avatarUrl: "https://example.com/avatar.jpg",
    enrolledAt: "2026-02-01T10:00:00Z",
    ...overrides,
  };
}

export function createMockLecture(
  overrides?: Partial<LectureResponse>,
): LectureResponse {
  return {
    id: "lecture-1",
    title: "Introduction to Components",
    summary: "Overview of React components",
    content: "<p>Components are the building blocks of React.</p>",
    videoObjectKey: "video.mp4",
    duration: 3600,
    uploadedAt: "2026-01-02T00:00:00Z",
    isCompleted: false,
    ...overrides,
  };
}

export function createMockMaterial(
  overrides?: Partial<MaterialResponse>,
): MaterialResponse {
  return {
    id: "mat-1",
    title: "Lecture Notes PDF",
    fileObjectKey: "notes.pdf",
    fileOriginalName: "lecture-notes.pdf",
    uploadedAt: "2026-01-03T00:00:00Z",
    ...overrides,
  };
}

export function createMockAssignment(
  overrides?: Partial<AssignmentResponse>,
): AssignmentResponse {
  return {
    id: "asgn-1",
    title: "Build a REST API",
    description: "<p>Implement user registration and authentication.</p>",
    createdAt: "2026-01-04T00:00:00Z",
    fileObjectKey: "asgn-spec.pdf",
    submittedAt: null,
    ...overrides,
  };
}

export function createMockSubmission(
  overrides?: Partial<SubmissionResponse>,
): SubmissionResponse {
  return {
    id: "sub-1",
    studentUsername: "student_1",
    fileObjectKey: "submission.zip",
    submittedAt: "2026-01-05T00:00:00Z",
    fileName: "my-submission.zip",
    contentType: "application/zip",
    fileSize: 102400,
    ...overrides,
  };
}

export function createMockForumPost(
  overrides?: Partial<PostResponse>,
): PostResponse {
  return {
    id: "post-1",
    title: "How to optimize React Query caching?",
    isMine: true,
    isSaved: false,
    authorUsername: "john_doe",
    authorFullName: "John Doe",
    authorAvatarUrl: "https://example.com/avatar.jpg",
    thumbUrl: "https://example.com/post-thumb.jpg",
    shortDescription: "Tips and best practices for React Query v5 caching",
    content: "<p>In this post, we discuss staleTime and gcTime configuration.</p>",
    views: 120,
    comments: 4,
    createdAt: "2026-01-06T00:00:00Z",
    updatedAt: "2026-01-06T00:00:00Z",
    ...overrides,
  };
}

export function createMockSavedPost(
  overrides?: Partial<SavedPostResponse>,
): SavedPostResponse {
  return {
    id: "saved-1",
    postId: "post-1",
    authorUsername: "john_doe",
    authorFullName: "John Doe",
    authorAvatarUrl: "https://example.com/avatar.jpg",
    thumbUrl: "https://example.com/post-thumb.jpg",
    title: "How to optimize React Query caching?",
    shortDescription: "Tips and best practices for React Query v5 caching",
    savedAt: "2026-01-07T00:00:00Z",
    postedDate: "2026-01-06T00:00:00Z",
    ...overrides,
  };
}

export function createMockForumComment(
  overrides?: Partial<ForumCommentResponse>,
): ForumCommentResponse {
  return {
    id: "comm-1",
    authorUsername: "jane_doe",
    authorFullName: "Jane Doe",
    authorAvatarUrl: "https://example.com/avatar2.jpg",
    content: "Great article!",
    replyCount: 0,
    repliedToCommentId: null,
    createdAt: "2026-01-07T00:00:00Z",
    isDeleted: false,
    isMine: false,
    ...overrides,
  };
}

export function createMockLectureComment(
  overrides?: Partial<LectureCommentResponse>,
): LectureCommentResponse {
  return {
    id: "lcomm-1",
    rootCommentId: null,
    parentCommentId: null,
    authorUsername: "jane_doe",
    authorFullName: "Jane Doe",
    authorAvatarUrl: "https://example.com/avatar2.jpg",
    content: "Could you explain line 42 further?",
    createdAt: "2026-01-08T00:00:00Z",
    isDeleted: false,
    isMine: false,
    depth: 0,
    replyCount: 0,
    ...overrides,
  };
}

export function createMockReview(
  overrides?: Partial<ReviewResponse>,
): ReviewResponse {
  return {
    id: "rev-1",
    comment: "Excellent course structure and pacing.",
    rating: 5,
    username: "john_doe",
    fullName: "John Doe",
    avatarUrl: "https://example.com/avatar.jpg",
    createdAt: "2026-01-09T00:00:00Z",
    ...overrides,
  };
}

export function createMockDiscount(
  overrides?: Partial<CourseDiscountResponse>,
): CourseDiscountResponse {
  return {
    id: "disc-1",
    courseId: "course-1",
    originalPrice: 100,
    courseTitle: "Mastering Next.js & Spring Boot",
    courseDescription: "Complete hands-on course",
    courseThumbnailUrl: "https://example.com/course-thumb.jpg",
    discountDescription: "Summer Launch Discount",
    discountPercentage: 25,
    validFrom: "2026-06-01T00:00:00Z",
    validTo: "2026-08-31T23:59:59Z",
    createdBy: "admin",
    createdAt: "2026-05-20T00:00:00Z",
    ...overrides,
  };
}

export function createMockNotification(
  overrides?: Partial<NotificationResponse>,
): NotificationResponse {
  return {
    id: "notif-1",
    username: "john_doe",
    type: null,
    title: "New Lecture Published",
    content: "A new lecture has been added to your enrolled course.",
    targetData: null,
    isRead: false,
    readAt: null,
    createdAt: "2026-01-10T00:00:00Z",
    category: "PERSONAL",
    createdBy: "admin",
    targetRoles: null,
    ...overrides,
  };
}

export function createMockQuiz(
  overrides?: Partial<QuizResponse>,
): QuizResponse {
  return {
    id: "quiz-1",
    courseId: "course-1",
    courseTitle: "Mastering Next.js & Spring Boot",
    title: "Mid-Term Examination",
    description: "Comprehensive test covering chapters 1 through 5",
    status: "APPROVED",
    rejectionReason: null,
    typeConfigs: [],
    questions: [],
    createdBy: "lecturer_1",
    createdAt: "2026-01-11T00:00:00Z",
    updatedAt: "2026-01-11T00:00:00Z",
    ...overrides,
  };
}

export function createMockQuizQuestion(
  overrides?: Partial<QuizQuestionResponse>,
): QuizQuestionResponse {
  return {
    id: "qq-1",
    quizId: "quiz-1",
    questionType: "SINGLE_CHOICE",
    content: "What is the output of typeof null?",
    points: 10,
    orderIndex: 1,
    options: [
      { id: "opt-1", questionId: "qq-1", optionText: "object", isCorrect: true, orderIndex: 1 },
      { id: "opt-2", questionId: "qq-1", optionText: "null", isCorrect: false, orderIndex: 2 },
    ],
    ...overrides,
  };
}

export function createMockGlobalDocument(
  overrides?: Partial<GlobalDocumentResponse>,
): GlobalDocumentResponse {
  return {
    id: "doc-1",
    title: "System Architecture Specification",
    fileName: "architecture.pdf",
    fileObjectKey: "docs/architecture.pdf",
    fileSize: 2048576,
    contentHash: "abc123hash",
    status: "READY",
    visibility: "GLOBAL",
    isPromoted: true,
    createdBy: "admin",
    createdAt: "2026-01-12T00:00:00Z",
    updatedAt: "2026-01-12T00:00:00Z",
    ...overrides,
  };
}

export function createMockDashboardOverview(
  overrides?: Partial<DashboardOverviewResponse>,
): DashboardOverviewResponse {
  return {
    totalUsers: 1250,
    totalCourses: 45,
    totalLectures: 320,
    totalAssignments: 85,
    totalEnrollments: 3400,
    totalRevenue: 154000,
    courseCompletionRate: 78.5,
    ...overrides,
  };
}
