package com.pht.dev_edu.common.service;

import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.common.util.ExceptionUtils;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.common.util.TransactionUtils;
import com.pht.dev_edu.tracking.dto.CronJobEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class DeleteProcessor {
    private final Executor executor;
    KafkaTemplate<String, Object> kafkaTemplate;

    public <T> BatchResult<T> processBatch(
            List<T> ids,
            Function<T, Void> handler
    ) {
        var futures = ids.stream()
                .map(id -> CompletableFuture.supplyAsync(() -> process(id, handler), executor))
                .toList();

        var results = futures.stream()
                .map(CompletableFuture::join)
                .toList();

        var successIds = results.stream()
                .filter(ProcessResult::success)
                .map(ProcessResult::id)
                .toList();

        var failedErrors = results.stream()
                .filter(r -> !r.success())
                .collect(Collectors.toMap(
                        ProcessResult::id,
                        ProcessResult::errorMessage,
                        (e1, e2) -> e1 + "; " + e2
                ));

        log.info("Batch done: success={}, failed={}",
                successIds.size(), failedErrors.size());

        if (!failedErrors.isEmpty()) {
            log.warn("Failed IDs with errors: {}", failedErrors);
        }

        return new BatchResult<>(successIds, failedErrors);
    }

    public void executeCleanupJobHasObjectKeys(
            String cronJobName,
            Supplier<List<String>> deleteFunction,
            String successMessageTemplate
    ) {
        var startTime = LocalDateTime.now();

        var cronJobEvent = CronJobEvent.builder()
                .cronJobName(cronJobName)
                .startTime(startTime)
                .build();

        try {
            var objectKeys = deleteFunction.get();

            TransactionUtils.runAfterCommitAsync(() -> {
                objectKeys.forEach(KafkaUtils::sendDeleteFileEvent);
            }, executor);

            cronJobEvent.setStatus(CronJobEvent.Status.SUCCESS);
            cronJobEvent.setDetails(
                    successMessageTemplate.formatted(objectKeys.size())
            );

        } catch (Exception e) {
            log.error("Error occurred in cron job: {}", cronJobName, e);

            cronJobEvent.setDetails("Error occurred during cleanup: " + cronJobName);
            cronJobEvent.setStatus(CronJobEvent.Status.FAILURE);
            cronJobEvent.setErrorMessage(e.getMessage());
            cronJobEvent.setErrorStackTrace(ExceptionUtils.getStackTraceAsString(e));
        } finally {
            var finishedTime = LocalDateTime.now();
            cronJobEvent.setFinishedTime(finishedTime);

            try {
                kafkaTemplate.send(
                        KafkaTopicConstant.CRON_JOB_EVENT_TOPIC,
                        cronJobEvent
                );
            } catch (Exception ex) {
                log.error("Failed to send cron job event", ex);
            }
        }
    }

    public void executeCleanupJob(
            String cronJobName,
            Supplier<Integer> deleteFunction,
            String successMessageTemplate
    ) {
        var startTime = LocalDateTime.now();

        var cronJobEvent = CronJobEvent.builder()
                .cronJobName(cronJobName)
                .startTime(startTime)
                .build();

        try {
            var deletedRows = deleteFunction.get();

            cronJobEvent.setStatus(CronJobEvent.Status.SUCCESS);
            cronJobEvent.setDetails(
                    successMessageTemplate.formatted(deletedRows)
            );

        } catch (Exception e) {
            log.error("Error occurred in cron job: {}", cronJobName, e);

            cronJobEvent.setDetails("Error occurred during cleanup: " + cronJobName);
            cronJobEvent.setStatus(CronJobEvent.Status.FAILURE);
            cronJobEvent.setErrorMessage(e.getMessage());
            cronJobEvent.setErrorStackTrace(ExceptionUtils.getStackTraceAsString(e));
        } finally {
            var finishedTime = LocalDateTime.now();
            cronJobEvent.setFinishedTime(finishedTime);

            try {
                kafkaTemplate.send(
                        KafkaTopicConstant.CRON_JOB_EVENT_TOPIC,
                        cronJobEvent
                );
            } catch (Exception ex) {
                log.error("Failed to send cron job event", ex);
            }
        }
    }

    private <T> ProcessResult<T> process(T id, Function<T, Void> handler) {
        try {
            handler.apply(id);
            return new ProcessResult<>(id, true, null);
        } catch (Exception e) {
            log.error("Delete failed for id {}", id, e);
            return new ProcessResult<>(id, false, e.getMessage());
        }
    }

    public record ProcessResult<T>(T id, boolean success, String errorMessage) {
    }

    public record BatchResult<T>(List<T> successIds, Map<T, String> failedErrors) {
    }
}