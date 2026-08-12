package com.pht.dev_edu.notification.service;

import com.pht.dev_edu.assignment.entity.AssignmentEntity;
import com.pht.dev_edu.assignment.repo.AssignmentRepository;
import com.pht.dev_edu.common.constant.RedisDurationConstant;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.enrollment.repo.EnrollmentRepository;
import com.pht.dev_edu.forum.entity.PostEntity;
import com.pht.dev_edu.forum.repo.PostRepository;
import com.pht.dev_edu.lecture.entity.LectureEntity;
import com.pht.dev_edu.lecture.repo.LectureRepository;
import com.pht.dev_edu.notification.dto.NotificationEvent;
import com.pht.dev_edu.notification.dto.NotificationTargetType;
import com.pht.dev_edu.notification.dto.PersonalNotificationEvent;
import com.pht.dev_edu.notification.entity.NotificationPersonalEntity;
import com.pht.dev_edu.notification.repo.NotificationPersonalRepository;
import com.pht.dev_edu.quiz.entity.QuizEntity;
import com.pht.dev_edu.quiz.repo.QuizRepo;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationPersonalServiceImpl implements NotificationPersonalService {
    NotificationPersonalRepository notificationPersonalRepository;

    QuizRepo quizRepo;
    PostRepository postRepo;
    LectureRepository lectureRepository;
    EnrollmentRepository enrollmentRepository;
    AssignmentRepository assignmentRepository;

    @Override
    public void publishNotification(PersonalNotificationEvent event) {
        log.info("Publishing personal notification event to Kafka for user: {}", event.getUsername());
        KafkaUtils.sendPersonalNotificationEvent(event);
    }

    @Override
    @Transactional
    public void saveFromEvent(PersonalNotificationEvent event) {
        var notifications = buildNotifications(event);
        if (notifications.isEmpty()) {
            return;
        }
        notificationPersonalRepository.saveAll(notifications);

        // Publish push notification event for each created notification into Kafka
        for (var notification : notifications) {
            try {
                java.util.Map<String, String> dataMap = new java.util.HashMap<>();
                if (notification.getTargetData() != null) {
                    notification.getTargetData().forEach((k, v) -> {
                        if (k != null && v != null) {
                            dataMap.put(k.name(), v);
                        }
                    });
                }
                var pushEvent = com.pht.dev_edu.notification.dto.PushNotificationEvent.builder()
                        .username(notification.getUsername())
                        .title(notification.getTitle())
                        .body(notification.getContent())
                        .data(dataMap)
                        .build();

                KafkaUtils.sendPushNotificationEvent(pushEvent);
                log.info("Published PushNotificationEvent to Kafka for username={}", notification.getUsername());
            } catch (Exception e) {
                log.warn("Failed to publish PushNotificationEvent to Kafka for user {}: {}", notification.getUsername(), e.getMessage());
            }
        }
    }

    @Override
    public long getUnreadCount(String username) {
        return notificationPersonalRepository.countByUsernameAndIsReadFalse(username);
    }

    @Override
    @Transactional
    public void markAsRead(UUID id, String username) {
        var notification = notificationPersonalRepository.findByIdAndUsername(id, username)
                .orElseThrow(() -> new DataNotFoundException("Personal notification not found with id: " + id));

        if (Boolean.FALSE.equals(notification.getIsRead())) {
            notificationPersonalRepository.markAsReadByIdAndUsername(id, username, LocalDateTime.now());
        }
    }

    @Override
    @Transactional
    public void markAllAsRead(String username) {
        notificationPersonalRepository.markAllAsReadByUsername(username, LocalDateTime.now());
    }

    private List<NotificationPersonalEntity> buildNotifications(PersonalNotificationEvent event) {
        Map<NotificationTargetType, String> targetData = event.getTargetData();
        NotificationEvent eventType = event.getEvent();
        String title = getEventTitle(eventType);

        List<String> targetUsernames = getTargetUsernames(event, targetData);

        return targetUsernames.stream()
                .map(username -> NotificationPersonalEntity.builder()
                        .type(eventType)
                        .title(title)
                        .username(username)
                        .content(event.getContent())
                        .targetData(targetData)
                        .isRead(false)
                        .build())
                .toList();
    }

    private List<String> getTargetUsernames(PersonalNotificationEvent event,
            Map<NotificationTargetType, String> targetData) {
        NotificationEvent eventType = event.getEvent();
        UUID courseId = resolveCourseId(eventType, targetData);

        boolean isCourseBroadcast = switch (eventType) {
            case COURSE_NEW_ASSIGNMENT, COURSE_NEW_MATERIAL, QUIZ_ACTIVE, COURSE_NEW_LECTURE -> true;
            default -> false;
        };

        if (isCourseBroadcast && courseId != null) {
            return enrollmentRepository.findAllEnrolledUsersByCourseId(courseId);
        }

        if (eventType == NotificationEvent.POST_COMMENT) {
            UUID postId = UUID.fromString(targetData.get(NotificationTargetType.POST));
            PostEntity post = RedisUtils.getOptionalDataFromCacheOrDb(
                    RedisPrefixConstant.POST_PREFIX + postId,
                    PostEntity.class,
                    () -> postRepo.findById(postId),
                    RedisDurationConstant.POST_DATA_DURATION);
            if (post == null) {
                throw new DataNotFoundException("Post not found with id: " + postId);
            }
            return List.of(post.getAuthor());
        }

        return event.getUsername() != null ? List.of(event.getUsername()) : List.of();
    }

    private UUID resolveCourseId(NotificationEvent eventType, Map<NotificationTargetType, String> targetData) {
        return switch (eventType) {
            case COURSE_NEW_ASSIGNMENT, COURSE_NEW_MATERIAL, LECTURE_COMMENT_RESPONSE -> {
                UUID lectureId = UUID.fromString(targetData.get(NotificationTargetType.LECTURE));
                yield resolveCourseIdByLectureId(lectureId, targetData);
            }
            case SUBMISSION_FEEDBACK -> {
                UUID assignmentId = UUID.fromString(targetData.get(NotificationTargetType.LECTURE));
                AssignmentEntity assignment = assignmentRepository.findById(assignmentId).orElseThrow(
                        () -> new DataNotFoundException("Assignment not found with id: " + assignmentId));
                yield resolveCourseIdByLectureId(assignment.getLectureId(), targetData);
            }
            case COURSE_NEW_LECTURE -> UUID.fromString(targetData.get(NotificationTargetType.COURSE));
            case QUIZ_ACTIVE, QUIZ_ASSIGNMENT_GRADED -> {
                UUID quizId = UUID.fromString(targetData.get(NotificationTargetType.COURSE));
                yield resolveCourseIdByQuizId(quizId, targetData);
            }
            default -> null;
        };
    }

    private UUID resolveCourseIdByLectureId(UUID lectureId, Map<NotificationTargetType, String> targetData) {
        LectureEntity lecture = RedisUtils.getOptionalDataFromCacheOrDb(
                RedisPrefixConstant.LECTURE_PREFIX + lectureId,
                LectureEntity.class,
                () -> lectureRepository.findById(lectureId),
                RedisDurationConstant.LECTURE_DATA_DURATION);
        if (lecture == null) {
            throw new DataNotFoundException("Lecture not found with id: " + lectureId);
        }
        UUID courseId = lecture.getCourseId();
        targetData.put(NotificationTargetType.COURSE, courseId.toString());
        return courseId;
    }

    private UUID resolveCourseIdByQuizId(UUID quizId, Map<NotificationTargetType, String> targetData) {
        QuizEntity quiz = RedisUtils.getOptionalDataFromCacheOrDb(
                RedisPrefixConstant.QUIZ_PREFIX + quizId,
                QuizEntity.class,
                () -> quizRepo.findById(quizId),
                RedisDurationConstant.QUIZ_DATA_DURATION);
        if (quiz == null) {
            throw new DataNotFoundException("Quiz not found with id: " + quizId);
        }
        UUID courseId = quiz.getCourseId();
        targetData.put(NotificationTargetType.COURSE, courseId.toString());
        return courseId;
    }

    private String getEventTitle(NotificationEvent eventType) {
        if (eventType == null) {
            return "New Notification";
        }
        return switch (eventType) {
            case COURSE_NEW_LECTURE -> "New Lecture Available";
            case COURSE_NEW_ASSIGNMENT -> "New Assignment Posted";
            case COURSE_NEW_MATERIAL -> "New Learning Material Added";
            case SUBMISSION_FEEDBACK -> "New Submission Feedback";
            case LECTURE_COMMENT_RESPONSE -> "New Reply to Lecture Comment";
            case QUIZ_ACTIVE -> "New Quiz Activated";
            case QUIZ_ASSIGNMENT_GRADED -> "Grading Results Updated";
            case POST_COMMENT -> "New Comment on Post";
            case POST_RESPONSE -> "New Reply to Post Comment";
        };
    }
}
