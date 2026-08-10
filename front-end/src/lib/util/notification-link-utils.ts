import type {
  NotificationEventType,
  NotificationTargetType,
  RoleEnum,
} from "@/lib/type/enum";
import type { NotificationResponse } from "@/lib/type/notification";

/**
 * Builds the appropriate redirect link for a personal notification
 * based on targetData, type, and current user roles.
 */
export function buildNotificationLink(
  notification: NotificationResponse,
  userRoles: (RoleEnum | string)[] = [],
): string {
  const isAdmin = userRoles.some((r) => r === "ADMIN");
  const isLecturer = userRoles.some((r) => r === "LECTURER");

  if (!notification.type || !notification.targetData) {
    return "/home";
  }

  const targetData = notification.targetData as Record<
    NotificationTargetType,
    string
  >;
  const eventType = notification.type as NotificationEventType;

  if (eventType === "POST_RESPONSE" || eventType === "POST_COMMENT") {
    const postId = targetData.POST;
    return `/posts?id=${postId}`;
  }

  if (
    eventType === "COURSE_NEW_LECTURE" ||
    eventType === "COURSE_NEW_ASSIGNMENT" ||
    eventType === "COURSE_NEW_MATERIAL" ||
    eventType === "SUBMISSION_FEEDBACK"
  ) {
    const courseId = targetData.COURSE;
    const lecturerId = targetData.LECTURE;
    return `/courses/${courseId}/lectures?lecturerId=${lecturerId}`;
  }

  if (eventType === "LECTURE_COMMENT_RESPONSE") {
    const courseId = targetData.COURSE;
    const lecturerId = targetData.LECTURE;

    if (isAdmin) {
      return `/admin/courses/${courseId}/lectures/${lecturerId}`;
    }

    if (isLecturer) {
      return `/lectures/courses/${courseId}/lectures/${lecturerId}`;
    }

    return `/courses/${courseId}/lectures?lecturerId=${lecturerId}`;
  }

  if (eventType === "QUIZ_ACTIVE") {
    const courseId = targetData.COURSE;
    return `/courses/${courseId}/quizzes`;
  }

  if (eventType === "QUIZ_ASSIGNMENT_GRADED") {
    const courseId = targetData.COURSE;
    const attemptId = targetData.QUIZ_ATTEMPT;

    return `/courses/${courseId}/quizzes/attempts/${attemptId}/result`;
  }

  return "/home";
}
