package com.pht.dev_edu.assignment.scheduler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.assignment.repo.AssignmentRepository;
import com.pht.dev_edu.assignment.service.AssignmentService;
import com.pht.dev_edu.common.constant.CronJobConstant;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.common.service.DeleteProcessor;
import com.pht.dev_edu.common.util.ExceptionUtils;
import com.pht.dev_edu.tracking.dto.CronJobEvent;
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
public class AssignmentScheduler {
    AssignmentService assignmentService;
    AssignmentRepository assignmentRepository;

    ObjectMapper objectMapper;
    DeleteProcessor batchDeleteProcessor;
    KafkaTemplate<String, Object> kafkaTemplate;

    private static final long DELETION_DELAY_DAYS = 60;

    // Run every hour to clean up deleted assignments and their associated files
    @Scheduled(fixedDelay = 60 * 60 * 1000)
    public void cleanDeletedAssignments() {
        var startTime = LocalDateTime.now();

        var cronJobEvent = CronJobEvent.builder()
                .cronJobName(CronJobConstant.CLEAN_DELETED_ASSIGNMENTS_JOB)
                .startTime(startTime)
                .build();
        try {
            var cutoffTime = LocalDateTime.now().minusDays(DELETION_DELAY_DAYS);
            var assignmentIds = assignmentRepository.findDeletedAssignmentIdsBeforeCutoffTime(cutoffTime);

            var result = batchDeleteProcessor.processBatch(
                    assignmentIds,
                    id -> {
                        assignmentService.deleteById(id);
                        return null;
                    }
            );

            var successCount = result.successIds().size();
            var failedCount = result.failedErrors().size();

            cronJobEvent.setDetails(
                    "Deleted " + successCount +
                    " assignments, failed to delete " + failedCount + " assignments."
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
            log.error("Error occurred while cleaning deleted assignments", e);
            cronJobEvent.setDetails("Error occurred while cleaning deleted assignments.");
            cronJobEvent.setStatus(CronJobEvent.Status.FAILURE);
            cronJobEvent.setErrorMessage(e.getMessage());
            cronJobEvent.setErrorStackTrace(ExceptionUtils.getStackTraceAsString(e));
        } finally {
            var endTime = LocalDateTime.now();
            log.info("Completed cleaning deleted assignments. Time taken: {} seconds", java.time.Duration.between(startTime, endTime).toSeconds());
            cronJobEvent.setFinishedTime(endTime);
            kafkaTemplate.send(KafkaTopicConstant.CRON_JOB_EVENT_TOPIC, cronJobEvent);
        }
    }
}
