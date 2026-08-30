package com.pht.dev_edu.course.scheduler;

import com.pht.dev_edu.common.constant.CronJobConstant;
import com.pht.dev_edu.common.service.DeleteProcessor;
import com.pht.dev_edu.course.repo.CourseRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Scheduled background tasks for courses.
 * Cleans up soft-deleted courses and triggers file deletion events for attached course thumbnails.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseScheduler {
    CourseRepository courseRepository;
    DeleteProcessor deleteProcessor;

    private static final long DELETION_DELAY_DAYS = 30;

    /**
     * Cleans up courses soft-deleted more than 30 days ago, returning thumbnail object keys for S3 removal.
     * Runs every hour.
     */
    @Scheduled(fixedDelay = 60 * 60 * 1000)
    @Transactional
    public void cleanDeletedCourses() {
        var cutoffTime = LocalDateTime.now().minusDays(DELETION_DELAY_DAYS);

        deleteProcessor.executeCleanupJobHasObjectKeys(
                CronJobConstant.CLEAN_DELETED_COURSES_JOB,
                () -> courseRepository
                        .deleteCoursesBeforeCutoffTimeThenReturnObjectKey(cutoffTime),
                "Deleted %d courses"
        );
    }
}
