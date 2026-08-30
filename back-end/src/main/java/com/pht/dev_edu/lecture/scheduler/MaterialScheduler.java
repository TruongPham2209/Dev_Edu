package com.pht.dev_edu.lecture.scheduler;

import com.pht.dev_edu.common.constant.CronJobConstant;
import com.pht.dev_edu.common.service.DeleteProcessor;
import com.pht.dev_edu.lecture.repo.LectureMaterialRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Scheduled background tasks for lecture supplementary materials.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MaterialScheduler {
    LectureMaterialRepository lectureMaterialRepository;
    DeleteProcessor deleteProcessor;

    private static final long DELETION_DELAY_DAYS = 30;

    /**
     * Cleans up lecture material attachments soft-deleted more than 30 days ago, returning S3 object keys for deletion.
     * Runs every 15 minutes.
     */
    @Scheduled(fixedDelay = 15 * 60 * 1000)
    @Transactional
    public void cleanDeletedMaterials() {
        var cutoffTime = LocalDateTime.now().minusDays(DELETION_DELAY_DAYS);

        deleteProcessor.executeCleanupJobHasObjectKeys(
                CronJobConstant.CLEAN_DELETED_MATERIALS_JOB,
                () -> lectureMaterialRepository
                        .deleteMaterialBeforeCutoffTimeThenReturnObjectKey(cutoffTime),
                "Deleted %d lecture materials."
        );
    }
}
