package com.pht.dev_edu.assignment.scheduler;

import com.pht.dev_edu.assignment.repo.AssignmentRepository;
import com.pht.dev_edu.assignment.service.AssignmentService;
import com.pht.dev_edu.common.constant.CronJobConstant;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.common.service.BatchDeleteProcessor;
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

    BatchDeleteProcessor batchDeleteProcessor;
    KafkaTemplate<String, Object> kafkaTemplate;

    private static final long DELETION_DELAY_DAYS = 60;

    // Run every hour to clean up deleted assignments and their associated files
    @Scheduled(fixedDelay = 60 * 60 * 1000)
    public void cleanDeletedAssignments() {
        var cutoffTime = LocalDateTime.now().minusDays(DELETION_DELAY_DAYS);
        var assignmentIds = assignmentRepository.findDeletedAssignmentIdsBeforeCutoffTime(cutoffTime);

        var result = batchDeleteProcessor.processBatch(
                assignmentIds,
                id -> {
                    assignmentService.deleteById(id);
                    return null;
                }
        );

        var conJobEvent = CronJobEvent.builder()
                .cronJobName(CronJobConstant.CLEAN_DELETED_ASSIGNMENTS_JOB)
                .details("Deleted " + result.successIds().size() + " assignments, failed to delete " + result.failedIds().size() + " assignments.")
                .build();
        kafkaTemplate.send(KafkaTopicConstant.CRON_JOB_EVENT_TOPIC, conJobEvent);
    }
}
