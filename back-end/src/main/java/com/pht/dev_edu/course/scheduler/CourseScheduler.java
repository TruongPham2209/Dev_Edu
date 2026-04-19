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

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseScheduler {
    CourseRepository courseRepository;
    DeleteProcessor deleteProcessor;

    private static final long DELETION_DELAY_DAYS = 30;

    // Run every hour to clean up deleted assignments and their associated files
    @Scheduled(fixedDelay = 60 * 60 * 1000)
    @Transactional
    public void cleanDeletedCourses() {
        var cutoffTime = LocalDateTime.now().minusDays(DELETION_DELAY_DAYS);

        deleteProcessor.executeCleanupJob(
                CronJobConstant.CLEAN_DELETED_MATERIALS_JOB,
                () -> courseRepository
                        .deleteCoursesBeforeCutoffTimeAndReturnObjectKey(cutoffTime),
                "Deleted %d courses"
        );
    }
}
