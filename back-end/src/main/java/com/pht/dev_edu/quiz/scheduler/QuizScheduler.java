package com.pht.dev_edu.quiz.scheduler;

import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.common.util.TransactionUtils;
import com.pht.dev_edu.notification.dto.NotificationEvent;
import com.pht.dev_edu.notification.dto.NotificationTargetType;
import com.pht.dev_edu.notification.dto.PersonalNotificationEvent;
import com.pht.dev_edu.notification.service.NotificationPersonalService;
import com.pht.dev_edu.quiz.dto.enums.AssignmentStatus;
import com.pht.dev_edu.quiz.dto.enums.AttemptStatus;
import com.pht.dev_edu.quiz.entity.QuizAssignmentEntity;
import com.pht.dev_edu.quiz.entity.QuizAttemptEntity;
import com.pht.dev_edu.quiz.entity.UserQuizSessionEntity;
import com.pht.dev_edu.quiz.repo.QuizAssignmentRepo;
import com.pht.dev_edu.quiz.repo.QuizAttemptRepo;
import com.pht.dev_edu.quiz.repo.UserQuizSessionRepo;
import com.pht.dev_edu.quiz.service.QuizAttemptService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executor;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizScheduler {
    QuizAttemptRepo attemptRepo;
    QuizAssignmentRepo assignmentRepo;
    UserQuizSessionRepo sessionRepo;

    Executor executor;
    NotificationPersonalService notificationPersonalService;
    QuizAttemptService attemptService;

    /**
     * Auto-submit attempts whose expires_at time has passed (runs every 1 minute)
     */
    @Scheduled(cron = "0 * * * * *")
    public void autoSubmitExpiredAttempts() {
        LocalDateTime now = LocalDateTime.now();
        List<QuizAttemptEntity> expiredAttempts = attemptRepo
                .findByStatusAndExpiresAtLessThanEqual(AttemptStatus.IN_PROGRESS, now);
        if (expiredAttempts.isEmpty()) {
            return;
        }

        log.info("Found {} expired quiz attempts to auto-submit", expiredAttempts.size());
        for (QuizAttemptEntity attempt : expiredAttempts) {
            try {
                attemptService.submitAttempt(attempt.getId(), "SYSTEM_AUTO_SUBMIT");
            } catch (Exception e) {
                log.error("Failed to auto-submit attempt ID {}: {}", attempt.getId(), e.getMessage(), e);
            }
        }
    }

    /**
     * Update Assignment status: SCHEDULED -> ACTIVE -> CLOSED (runs every 1 minute)
     */
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void updateAssignmentStatuses() {
        LocalDateTime now = LocalDateTime.now();

        // SCHEDULED -> ACTIVE or CLOSED
        List<QuizAssignmentEntity> toActiveList = assignmentRepo
                .findByStatusAndStartTimeLessThanEqualAndDeletedAtIsNull(AssignmentStatus.SCHEDULED, now);
        for (QuizAssignmentEntity assignment : toActiveList) {
            if (assignment.getEndTime() == null || !now.isAfter(assignment.getEndTime())) {
                assignment.setStatus(AssignmentStatus.ACTIVE);
                log.info("Transitioned assignment ID {} to ACTIVE", assignment.getId());

                TransactionUtils.runAfterCommitAsync(() -> {
                    Map<NotificationTargetType, String> targetData = new HashMap<>();
                    targetData.put(NotificationTargetType.COURSE, assignment.getQuizId().toString());
                    PersonalNotificationEvent event = PersonalNotificationEvent.builder()
                            .event(NotificationEvent.QUIZ_ACTIVE)
                            .targetData(targetData)
                            .content(assignment.getAssignmentName())
                            .build();
                    notificationPersonalService.publishNotification(event);
                }, executor);
            } else {
                assignment.setStatus(AssignmentStatus.CLOSED);
                log.info("Transitioned assignment ID {} to CLOSED", assignment.getId());
            }
            assignmentRepo.save(assignment);
            RedisUtils.invalidateCache(RedisPrefixConstant.QUIZ_ASSIGNMENT_PREFIX + assignment.getId());
        }

        // ACTIVE -> CLOSED
        List<QuizAssignmentEntity> toClosedList = assignmentRepo
                .findByStatusAndEndTimeNotNullAndEndTimeLessThanEqualAndDeletedAtIsNull(AssignmentStatus.ACTIVE, now);
        for (QuizAssignmentEntity assignment : toClosedList) {
            assignment.setStatus(AssignmentStatus.CLOSED);
            assignmentRepo.save(assignment);
            RedisUtils.invalidateCache(RedisPrefixConstant.QUIZ_ASSIGNMENT_PREFIX + assignment.getId());
            log.info("Transitioned assignment ID {} to CLOSED", assignment.getId());
        }
    }

    /**
     * Clean up expired sessions (runs every hour)
     */
    @Scheduled(cron = "0 0 * * * *")
    public void cleanupExpiredSessions() {
        LocalDateTime now = LocalDateTime.now();
        List<UserQuizSessionEntity> expiredSessions = sessionRepo.findByIsActiveTrueAndExpiresAtLessThan(now);
        if (expiredSessions.isEmpty()) {
            return;
        }

        for (UserQuizSessionEntity session : expiredSessions) {
            session.setIsActive(false);
            session.setRevokedAt(now);
            session.setRevokedReason("EXPIRED");
            sessionRepo.save(session);
        }
        log.info("Cleaned up {} expired user quiz sessions", expiredSessions.size());
    }
}
