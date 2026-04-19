package com.pht.dev_edu.lecture.scheduler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.common.constant.CronJobConstant;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.common.service.DeleteProcessor;
import com.pht.dev_edu.common.util.ExceptionUtils;
import com.pht.dev_edu.lecture.repo.LectureRepository;
import com.pht.dev_edu.lecture.service.LectureService;
import com.pht.dev_edu.tracking.dto.CronJobEvent;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LectureScheduler {
    LectureRepository lectureRepository;
    LectureService lectureService;

    ObjectMapper objectMapper;
    DeleteProcessor batchDeleteProcessor;
    KafkaTemplate<String, Object> kafkaTemplate;

    private static final long DELETION_DELAY_DAYS = 60;

    // Run every hour to clean up deleted comments that are older than the specified delay
    @Scheduled(fixedDelay = 60 * 60 * 1000)
    @Transactional
    public void cleanDeletedLectures() {
        var startTime = LocalDateTime.now();

        var cronJobEvent = CronJobEvent.builder()
                .cronJobName(CronJobConstant.CLEAN_DELETED_LECTURES_JOB)
                .startTime(startTime)
                .build();

        try {
            var cutoffTime = LocalDateTime.now().minusDays(DELETION_DELAY_DAYS);
            var assignmentIds = lectureRepository.findDeletedIdsBeforeCutoffTime(cutoffTime);

            var result = batchDeleteProcessor.processBatch(
                    assignmentIds,
                    id -> {
                        lectureService.deleteById(id);
                        return null;
                    }
            );

            var successCount = result.successIds().size();
            var failedCount = result.failedErrors().size();

            cronJobEvent.setDetails(
                    "Deleted " + successCount +
                    " lecturers, failed to delete " + failedCount + " lecturers."
            );

            cronJobEvent.setStatus(
                    failedCount == 0
                            ? CronJobEvent.Status.SUCCESS
                            : CronJobEvent.Status.PARTIAL_FAILURE
            );

            cronJobEvent.setErrorMessage(
                    failedCount == 0
                            ? null
                            : objectMapper.writeValueAsString(result.failedErrors())
            );
        } catch (Exception e) {
            log.error("Error occurred while cleaning deleted lectures", e);
            cronJobEvent.setDetails("Error occurred while cleaning deleted lectures.");
            cronJobEvent.setStatus(CronJobEvent.Status.FAILURE);
            cronJobEvent.setErrorMessage(e.getMessage());
            cronJobEvent.setErrorStackTrace(ExceptionUtils.getStackTraceAsString(e));
        } finally {
            var endTime = LocalDateTime.now();
            log.info("Cron job '{}' completed. Start time: {}, End time: {}",
                    CronJobConstant.CLEAN_DELETED_LECTURES_JOB, startTime, endTime);

            cronJobEvent.setFinishedTime(endTime);
            kafkaTemplate.send(KafkaTopicConstant.CRON_JOB_EVENT_TOPIC, cronJobEvent);
        }
    }
}
