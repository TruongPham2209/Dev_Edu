package com.pht.dev_edu.course.scheduler;

import com.pht.dev_edu.common.constant.CronJobConstant;
import com.pht.dev_edu.common.service.DeleteProcessor;
import com.pht.dev_edu.course.repo.CategoryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Scheduled background tasks for course categories.
 * Cleans up soft-deleted categories and triggers file deletion events for attached thumbnails.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryScheduler {
    CategoryRepository categoryRepository;
    DeleteProcessor deleteProcessor;

    private static final long DELETION_DELAY_DAYS = 30;

    /**
     * Cleans up categories soft-deleted more than 30 days ago, returning thumbnail object keys for S3 removal.
     * Runs every hour.
     */
    @Scheduled(fixedDelay = 60 * 60 * 1000)
    @Transactional
    public void cleanDeletedAssignments() {
        var cutoffTime = LocalDateTime.now().minusDays(DELETION_DELAY_DAYS);

        deleteProcessor.executeCleanupJobHasObjectKeys(
                CronJobConstant.CLEAN_DELETED_CATEGORIES_JOB,
                () -> categoryRepository
                        .deleteCategoriesBeforeCutoffTimeThenReturnObjectKey(cutoffTime),
                "Deleted %d categories."
        );
    }
}
