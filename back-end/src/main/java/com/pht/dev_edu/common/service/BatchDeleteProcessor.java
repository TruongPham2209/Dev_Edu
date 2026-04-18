package com.pht.dev_edu.common.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.function.Function;

@Slf4j
@Component
@RequiredArgsConstructor
public class BatchDeleteProcessor {
    private final Executor executor;

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

        var failedIds = results.stream()
                .filter(r -> !r.success())
                .map(ProcessResult::id)
                .toList();

        log.info("Batch done: success={}, failed={}", successIds.size(), failedIds.size());

        if (!failedIds.isEmpty()) {
            log.warn("Failed IDs: {}", failedIds);
        }

        return new BatchResult<>(successIds, failedIds);
    }

    private <T> ProcessResult<T> process(T id, Function<T, Void> handler) {
        try {
            handler.apply(id);
            return new ProcessResult<>(id, true);
        } catch (Exception e) {
            log.error("Delete failed for id {}", id, e);
            return new ProcessResult<>(id, false);
        }
    }

    public record ProcessResult<T>(T id, boolean success) {
    }

    public record BatchResult<T>(List<T> successIds, List<T> failedIds) {
    }
}