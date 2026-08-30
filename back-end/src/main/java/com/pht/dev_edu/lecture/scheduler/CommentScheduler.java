package com.pht.dev_edu.lecture.scheduler;

import com.pht.dev_edu.common.constant.CronJobConstant;
import com.pht.dev_edu.common.service.DeleteProcessor;
import com.pht.dev_edu.lecture.repo.LectureCommentRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Scheduled background tasks for lecture video comments.
 */
@Slf4j
@Component("lectureCommentScheduler")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommentScheduler {
    LectureCommentRepository lectureCommentRepository;
    DeleteProcessor deleteProcessor;

    private static final long DELETION_DELAY_DAYS = 7;

    /**
     * Cleans up lecture comments that were soft-deleted more than 7 days ago.
     * Runs every hour.
     */
    @Scheduled(fixedDelay = 60 * 60 * 1000)
    @Transactional
    public void cleanDeletedComments() {
        var cutoffTime = LocalDateTime.now().minusDays(DELETION_DELAY_DAYS);

        deleteProcessor.executeCleanupJob(
                CronJobConstant.CLEAN_DELETED_LECTURE_COMMENTS_JOB,
                () -> lectureCommentRepository.deleteByDeletedAtBefore(cutoffTime),
                "Deleted %d lecture comments."
        );
    }
}
