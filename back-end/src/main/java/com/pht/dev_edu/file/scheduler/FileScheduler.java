package com.pht.dev_edu.file.scheduler;

import com.pht.dev_edu.common.constant.CronJobConstant;
import com.pht.dev_edu.common.service.DeleteProcessor;
import com.pht.dev_edu.file.repo.FileUploadRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Scheduled background tasks for file upload cleanup.
 * Removes expired pre-signed upload records and failed uploads from S3 storage and database.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileScheduler {
    FileUploadRepository fileUploadRepository;
    DeleteProcessor deleteProcessor;

    private static final long TIME_EXTEND_MINUTES = 1;

    /**
     * Cleans up expired and failed upload records and removes orphaned files from S3.
     * Runs every 5 minutes.
     */
    @Scheduled(fixedDelay = 5 * 60 * 1000)
    @Transactional
    public void cleanExpiredAndFailedFiles() {
        var cutoffTime = LocalDateTime.now().minusMinutes(TIME_EXTEND_MINUTES);

        deleteProcessor.executeCleanupJobHasObjectKeys(
                CronJobConstant.CLEAN_EXPIRED_AND_FAILED_FILES_JOB,
                () -> fileUploadRepository.deleteExpiredAndFailedFilesThenReturnObjectKeys(cutoffTime),
                "Deleted %d expired/failed files."
        );
    }
}
