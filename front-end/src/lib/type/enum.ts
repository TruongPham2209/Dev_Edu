export type ItemStatus = "ACTIVE" | "DELETED" | "ALL";

export type RoleEnum = "STUDENT" | "LECTURER" | "ADMIN";

export type EntityType = "COURSE" | "SUBSCRIPTION";

export type PaymentMethod = "VNPAY" | "MOMO" | "ZALOPAY" | "PAYPAL" | "STRIPE";

export type PostStatus = "PENDING" | "SUPERSEDED" | "APPROVED" | "REJECTED";

export type SubmissionLogStatus = "SUBMITTED" | "UNSUBMITTED";

export type PaymentStatus = "COMPLETED" | "FAILED" | "CANCELLED";

export type MetricPeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export type NotificationCategory = "PERSONAL" | "GROUP";

export type NotificationTargetType =
  | "COURSE"
  | "LECTURE"
  | "POST"
  | "QUIZ"
  | "QUIZ_ATTEMPT";

export type NotificationEventType =
  | "COURSE_NEW_LECTURE"
  | "COURSE_NEW_ASSIGNMENT"
  | "COURSE_NEW_MATERIAL"
  | "SUBMISSION_FEEDBACK"
  | "LECTURE_COMMENT_RESPONSE"
  | "QUIZ_ACTIVE"
  | "QUIZ_ASSIGNMENT_GRADED"
  | "POST_COMMENT"
  | "POST_RESPONSE";
