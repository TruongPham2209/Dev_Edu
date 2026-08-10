package com.pht.dev_edu.notification.service;

import com.pht.dev_edu.assignment.entity.AssignmentEntity;
import com.pht.dev_edu.assignment.repo.AssignmentRepository;
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
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Supplier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/*
 * <analysis>
 * NotificationPersonalServiceImpl
 * - publishNotification(PersonalNotificationEvent event)
 *   - branches:
 *       sends personal notification event via KafkaUtils
 *   - paths:
 *       [P1: publish event to Kafka]
 *   - planned tests:
 *       [shouldPublishNotificationEventToKafka -> P1]
 *
 * - saveFromEvent(PersonalNotificationEvent event)
 *   - branches:
 *       buildNotifications returns empty -> return early without saving
 *       buildNotifications returns entities -> saveAll to repository
 *       target username resolution based on event type:
 *         - COURSE_NEW_LECTURE: course broadcast via enrollmentRepo
 *         - COURSE_NEW_ASSIGNMENT / COURSE_NEW_MATERIAL: lecture -> course -> enrollmentRepo
 *         - QUIZ_ACTIVE: quiz -> course -> enrollmentRepo
 *         - POST_COMMENT: post -> author
 *         - SUBMISSION_FEEDBACK: assignment -> lecture -> course
 *         - direct user event: event.username
 *       data not found guard clauses:
 *         - lecture not found -> DataNotFoundException
 *         - assignment not found -> DataNotFoundException
 *         - quiz not found -> DataNotFoundException
 *         - post not found -> DataNotFoundException
 *   - paths:
 *       [P1: broadcast course new lecture event saves notifications for enrolled users]
 *       [P2: broadcast course new assignment event saves notifications]
 *       [P3: post comment event saves notification for post author]
 *       [P4: quiz active event saves notifications for enrolled users]
 *       [P5: submission feedback event saves notification for target user]
 *       [P6: missing lecture throws DataNotFoundException]
 *       [P7: missing assignment throws DataNotFoundException]
 *       [P8: missing quiz throws DataNotFoundException]
 *       [P9: missing post throws DataNotFoundException]
 *       [P10: empty target users returns early without saveAll]
 *   - planned tests:
 *       [shouldSaveNotificationsFromCourseNewLectureEvent -> P1]
 *       [shouldSaveNotificationsFromCourseNewAssignmentEvent -> P2]
 *       [shouldSaveNotificationsFromPostCommentEvent -> P3]
 *       [shouldSaveNotificationsFromQuizActiveEvent -> P4]
 *       [shouldSaveNotificationsFromSubmissionFeedbackEvent -> P5]
 *       [shouldThrowDataNotFoundWhenLectureIsMissing -> P6]
 *       [shouldThrowDataNotFoundWhenAssignmentIsMissing -> P7]
 *       [shouldThrowDataNotFoundWhenQuizIsMissing -> P8]
 *       [shouldThrowDataNotFoundWhenPostIsMissing -> P9]
 *       [shouldReturnEarlyWhenNoTargetUsersResolved -> P10]
 *
 * - getUnreadCount(String username)
 *   - branches:
 *       returns unread count from repository
 *   - paths:
 *       [P1: returns count]
 *   - planned tests:
 *       [shouldReturnUnreadPersonalNotificationCount -> P1]
 *
 * - markAsRead(UUID id, String username)
 *   - branches:
 *       notification not found -> DataNotFoundException
 *       notification isRead is true -> do not update
 *       notification isRead is false/null -> markAsReadByIdAndUsername
 *   - paths:
 *       [P1: notification not found -> DataNotFoundException]
 *       [P2: notification already read -> no-op]
 *       [P3: notification not read -> update read timestamp]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenPersonalNotificationDoesNotExist -> P1]
 *       [shouldNotUpdateWhenNotificationIsAlreadyRead -> P2]
 *       [shouldMarkPersonalNotificationAsRead -> P3]
 *
 * - markAllAsRead(String username)
 *   - branches:
 *       calls markAllAsReadByUsername in repository
 *   - paths:
 *       [P1: mark all as read for user]
 *   - planned tests:
 *       [shouldMarkAllPersonalNotificationsAsReadForUser -> P1]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for NotificationPersonalServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify personal notification processing, event consumption, and read marking logic.
 *
 * Test Scope
 * ----------
 * - publishNotification()
 * - saveFromEvent()
 * - getUnreadCount()
 * - markAsRead()
 * - markAllAsRead()
 *
 * Covered Scenarios
 * -----------------
 * ✓ Kafka publishing for personal events
 * ✓ Building personal notification entities from diverse event types
 * ✓ Course broadcast target user expansion via enrollment lookup
 * ✓ Target data resolution for lectures, assignments, quizzes, and posts
 * ✓ Guard clauses throwing DataNotFoundException for missing aggregate references
 * ✓ Unread counting and idempotent read status updates
 *
 * Mocked Dependencies
 * -------------------
 * - NotificationPersonalRepository
 * - QuizRepo
 * - PostRepository
 * - LectureRepository
 * - EnrollmentRepository
 * - AssignmentRepository
 * - KafkaUtils (static)
 * - RedisUtils (static)
 */
@ExtendWith(MockitoExtension.class)
class NotificationPersonalServiceImplTest {

    @Mock
    private NotificationPersonalRepository notificationPersonalRepository;
    @Mock
    private QuizRepo quizRepo;
    @Mock
    private PostRepository postRepo;
    @Mock
    private LectureRepository lectureRepository;
    @Mock
    private EnrollmentRepository enrollmentRepository;
    @Mock
    private AssignmentRepository assignmentRepository;

    @InjectMocks
    private NotificationPersonalServiceImpl notificationPersonalService;

    private MockedStatic<KafkaUtils> kafkaUtilsMock;
    private MockedStatic<RedisUtils> redisUtilsMock;

    private static final String USERNAME = "user1";
    private static final UUID NOTIF_ID = UUID.randomUUID();
    private static final UUID COURSE_ID = UUID.randomUUID();
    private static final UUID LECTURE_ID = UUID.randomUUID();
    private static final UUID ASSIGNMENT_ID = UUID.randomUUID();
    private static final UUID QUIZ_ID = UUID.randomUUID();
    private static final UUID POST_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        kafkaUtilsMock = mockStatic(KafkaUtils.class);
        redisUtilsMock = mockStatic(RedisUtils.class);

        // Default setup for RedisUtils supplier delegation
        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), any(), any(), any()))
                .thenAnswer(invocation -> {
                    Supplier<?> supplier = invocation.getArgument(2);
                    Optional<?> opt = (Optional<?>) supplier.get();
                    return opt.orElse(null);
                });
    }

    @AfterEach
    void tearDown() {
        kafkaUtilsMock.close();
        redisUtilsMock.close();
    }

    // ==================== publishNotification ====================

    @Test
    @DisplayName("publishNotification - should publish notification event to Kafka")
    void shouldPublishNotificationEventToKafka() {
        // Arrange
        PersonalNotificationEvent event = PersonalNotificationEvent.builder()
                .username(USERNAME)
                .content("New message")
                .event(NotificationEvent.POST_COMMENT)
                .build();

        // Act
        notificationPersonalService.publishNotification(event);

        // Assert
        kafkaUtilsMock.verify(() -> KafkaUtils.sendPersonalNotificationEvent(event));
    }

    // ==================== saveFromEvent ====================

    @Test
    @DisplayName("saveFromEvent - should save notifications from course new lecture event for enrolled users")
    void shouldSaveNotificationsFromCourseNewLectureEvent() {
        // Arrange
        Map<NotificationTargetType, String> targetData = new HashMap<>();
        targetData.put(NotificationTargetType.COURSE, COURSE_ID.toString());

        PersonalNotificationEvent event = PersonalNotificationEvent.builder()
                .event(NotificationEvent.COURSE_NEW_LECTURE)
                .content("Lecture 1 available")
                .targetData(targetData)
                .build();

        when(enrollmentRepository.findAllEnrolledUsersByCourseId(COURSE_ID))
                .thenReturn(List.of("student1", "student2"));

        // Act
        notificationPersonalService.saveFromEvent(event);

        // Assert
        verify(notificationPersonalRepository).saveAll(any());
    }

    @Test
    @DisplayName("saveFromEvent - should save notifications from course new assignment event")
    void shouldSaveNotificationsFromCourseNewAssignmentEvent() {
        // Arrange
        Map<NotificationTargetType, String> targetData = new HashMap<>();
        targetData.put(NotificationTargetType.LECTURE, LECTURE_ID.toString());

        PersonalNotificationEvent event = PersonalNotificationEvent.builder()
                .event(NotificationEvent.COURSE_NEW_ASSIGNMENT)
                .content("Assignment 1 posted")
                .targetData(targetData)
                .build();

        LectureEntity lecture = LectureEntity.builder()
                .id(LECTURE_ID)
                .courseId(COURSE_ID)
                .build();

        when(lectureRepository.findById(LECTURE_ID)).thenReturn(Optional.of(lecture));
        when(enrollmentRepository.findAllEnrolledUsersByCourseId(COURSE_ID)).thenReturn(List.of("student1"));

        // Act
        notificationPersonalService.saveFromEvent(event);

        // Assert
        verify(notificationPersonalRepository).saveAll(any());
    }

    @Test
    @DisplayName("saveFromEvent - should save notifications from post comment event for post author")
    void shouldSaveNotificationsFromPostCommentEvent() {
        // Arrange
        Map<NotificationTargetType, String> targetData = new HashMap<>();
        targetData.put(NotificationTargetType.POST, POST_ID.toString());

        PersonalNotificationEvent event = PersonalNotificationEvent.builder()
                .event(NotificationEvent.POST_COMMENT)
                .content("Someone commented on your post")
                .targetData(targetData)
                .build();

        PostEntity post = PostEntity.builder()
                .id(POST_ID)
                .author("authorUser")
                .build();

        when(postRepo.findById(POST_ID)).thenReturn(Optional.of(post));

        // Act
        notificationPersonalService.saveFromEvent(event);

        // Assert
        verify(notificationPersonalRepository).saveAll(any());
    }

    @Test
    @DisplayName("saveFromEvent - should save notifications from quiz active event for enrolled users")
    void shouldSaveNotificationsFromQuizActiveEvent() {
        // Arrange
        Map<NotificationTargetType, String> targetData = new HashMap<>();
        targetData.put(NotificationTargetType.COURSE, QUIZ_ID.toString());

        PersonalNotificationEvent event = PersonalNotificationEvent.builder()
                .event(NotificationEvent.QUIZ_ACTIVE)
                .content("Quiz is now active")
                .targetData(targetData)
                .build();

        QuizEntity quiz = QuizEntity.builder()
                .id(QUIZ_ID)
                .courseId(COURSE_ID)
                .build();

        when(quizRepo.findById(QUIZ_ID)).thenReturn(Optional.of(quiz));
        when(enrollmentRepository.findAllEnrolledUsersByCourseId(COURSE_ID)).thenReturn(List.of("student1"));

        // Act
        notificationPersonalService.saveFromEvent(event);

        // Assert
        verify(notificationPersonalRepository).saveAll(any());
    }

    @Test
    @DisplayName("saveFromEvent - should save notifications from submission feedback event for target user")
    void shouldSaveNotificationsFromSubmissionFeedbackEvent() {
        // Arrange
        Map<NotificationTargetType, String> targetData = new HashMap<>();
        targetData.put(NotificationTargetType.LECTURE, ASSIGNMENT_ID.toString());

        PersonalNotificationEvent event = PersonalNotificationEvent.builder()
                .event(NotificationEvent.SUBMISSION_FEEDBACK)
                .username(USERNAME)
                .content("Your submission was graded")
                .targetData(targetData)
                .build();

        AssignmentEntity assignment = AssignmentEntity.builder()
                .id(ASSIGNMENT_ID)
                .lectureId(LECTURE_ID)
                .build();

        LectureEntity lecture = LectureEntity.builder()
                .id(LECTURE_ID)
                .courseId(COURSE_ID)
                .build();

        when(assignmentRepository.findById(ASSIGNMENT_ID)).thenReturn(Optional.of(assignment));
        when(lectureRepository.findById(LECTURE_ID)).thenReturn(Optional.of(lecture));

        // Act
        notificationPersonalService.saveFromEvent(event);

        // Assert
        verify(notificationPersonalRepository).saveAll(any());
    }

    @Test
    @DisplayName("saveFromEvent - should throw DataNotFoundException when lecture is missing")
    void shouldThrowDataNotFoundWhenLectureIsMissing() {
        // Arrange
        Map<NotificationTargetType, String> targetData = new HashMap<>();
        targetData.put(NotificationTargetType.LECTURE, LECTURE_ID.toString());

        PersonalNotificationEvent event = PersonalNotificationEvent.builder()
                .event(NotificationEvent.COURSE_NEW_ASSIGNMENT)
                .targetData(targetData)
                .build();

        when(lectureRepository.findById(LECTURE_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> notificationPersonalService.saveFromEvent(event))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Lecture not found with id: " + LECTURE_ID);
    }

    @Test
    @DisplayName("saveFromEvent - should throw DataNotFoundException when assignment is missing")
    void shouldThrowDataNotFoundWhenAssignmentIsMissing() {
        // Arrange
        Map<NotificationTargetType, String> targetData = new HashMap<>();
        targetData.put(NotificationTargetType.LECTURE, ASSIGNMENT_ID.toString());

        PersonalNotificationEvent event = PersonalNotificationEvent.builder()
                .event(NotificationEvent.SUBMISSION_FEEDBACK)
                .targetData(targetData)
                .build();

        when(assignmentRepository.findById(ASSIGNMENT_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> notificationPersonalService.saveFromEvent(event))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Assignment not found with id: " + ASSIGNMENT_ID);
    }

    @Test
    @DisplayName("saveFromEvent - should throw DataNotFoundException when quiz is missing")
    void shouldThrowDataNotFoundWhenQuizIsMissing() {
        // Arrange
        Map<NotificationTargetType, String> targetData = new HashMap<>();
        targetData.put(NotificationTargetType.COURSE, QUIZ_ID.toString());

        PersonalNotificationEvent event = PersonalNotificationEvent.builder()
                .event(NotificationEvent.QUIZ_ACTIVE)
                .targetData(targetData)
                .build();

        when(quizRepo.findById(QUIZ_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> notificationPersonalService.saveFromEvent(event))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Quiz not found with id: " + QUIZ_ID);
    }

    @Test
    @DisplayName("saveFromEvent - should throw DataNotFoundException when post is missing")
    void shouldThrowDataNotFoundWhenPostIsMissing() {
        // Arrange
        Map<NotificationTargetType, String> targetData = new HashMap<>();
        targetData.put(NotificationTargetType.POST, POST_ID.toString());

        PersonalNotificationEvent event = PersonalNotificationEvent.builder()
                .event(NotificationEvent.POST_COMMENT)
                .targetData(targetData)
                .build();

        when(postRepo.findById(POST_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> notificationPersonalService.saveFromEvent(event))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Post not found with id: " + POST_ID);
    }

    @Test
    @DisplayName("saveFromEvent - should return early when no target users resolved")
    void shouldReturnEarlyWhenNoTargetUsersResolved() {
        // Arrange
        PersonalNotificationEvent event = PersonalNotificationEvent.builder()
                .event(NotificationEvent.POST_RESPONSE)
                .username(null)
                .targetData(Collections.emptyMap())
                .build();

        // Act
        notificationPersonalService.saveFromEvent(event);

        // Assert
        verify(notificationPersonalRepository, never()).saveAll(any());
    }

    // ==================== getUnreadCount ====================

    @Test
    @DisplayName("getUnreadCount - should return unread personal notification count")
    void shouldReturnUnreadPersonalNotificationCount() {
        // Arrange
        when(notificationPersonalRepository.countByUsernameAndIsReadFalse(USERNAME)).thenReturn(3L);

        // Act
        long count = notificationPersonalService.getUnreadCount(USERNAME);

        // Assert
        assertThat(count).isEqualTo(3L);
    }

    // ==================== markAsRead ====================

    @Test
    @DisplayName("markAsRead - should throw DataNotFoundException when personal notification does not exist")
    void shouldThrowDataNotFoundWhenPersonalNotificationDoesNotExist() {
        // Arrange
        when(notificationPersonalRepository.findByIdAndUsername(NOTIF_ID, USERNAME)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> notificationPersonalService.markAsRead(NOTIF_ID, USERNAME))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Personal notification not found with id: " + NOTIF_ID);
    }

    @Test
    @DisplayName("markAsRead - should not update when notification is already read")
    void shouldNotUpdateWhenNotificationIsAlreadyRead() {
        // Arrange
        NotificationPersonalEntity entity = NotificationPersonalEntity.builder()
                .id(NOTIF_ID)
                .username(USERNAME)
                .isRead(true)
                .build();

        when(notificationPersonalRepository.findByIdAndUsername(NOTIF_ID, USERNAME)).thenReturn(Optional.of(entity));

        // Act
        notificationPersonalService.markAsRead(NOTIF_ID, USERNAME);

        // Assert
        verify(notificationPersonalRepository, never()).markAsReadByIdAndUsername(any(), any(), any());
    }

    @Test
    @DisplayName("markAsRead - should mark personal notification as read")
    void shouldMarkPersonalNotificationAsRead() {
        // Arrange
        NotificationPersonalEntity entity = NotificationPersonalEntity.builder()
                .id(NOTIF_ID)
                .username(USERNAME)
                .isRead(false)
                .build();

        when(notificationPersonalRepository.findByIdAndUsername(NOTIF_ID, USERNAME)).thenReturn(Optional.of(entity));

        // Act
        notificationPersonalService.markAsRead(NOTIF_ID, USERNAME);

        // Assert
        verify(notificationPersonalRepository).markAsReadByIdAndUsername(eq(NOTIF_ID), eq(USERNAME), any(LocalDateTime.class));
    }

    // ==================== markAllAsRead ====================

    @Test
    @DisplayName("markAllAsRead - should mark all personal notifications as read for user")
    void shouldMarkAllPersonalNotificationsAsReadForUser() {
        // Act
        notificationPersonalService.markAllAsRead(USERNAME);

        // Assert
        verify(notificationPersonalRepository).markAllAsReadByUsername(eq(USERNAME), any(LocalDateTime.class));
    }
}
