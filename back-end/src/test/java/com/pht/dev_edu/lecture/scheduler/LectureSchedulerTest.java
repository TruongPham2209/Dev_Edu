package com.pht.dev_edu.lecture.scheduler;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

/*
 * <analysis>
 * LectureScheduler
 * - cleanDeletedLectures()
 *   - paths:
 *       [P1: executes batch delete process on deleted lectures and publishes CronJobEvent]
 *   - planned tests:
 *       [shouldExecuteBatchDeleteJobForDeletedLectures -> P1]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for LectureScheduler
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify scheduled lecture cleanup execution in LectureScheduler.
 *
 * Test Scope
 * ----------
 * - cleanDeletedLectures()
 *
 * Covered Scenarios
 * -----------------
 * ✓ Invoking batchDeleteProcessor for soft-deleted lectures cutoff cleanup
 *
 * Mocked Dependencies
 * -------------------
 * - LectureService
 * - LectureRepository
 * - ObjectMapper
 * - DeleteProcessor
 * - KafkaTemplate
 */

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.common.service.DeleteProcessor;
import com.pht.dev_edu.lecture.repo.LectureRepository;
import com.pht.dev_edu.lecture.service.LectureService;
import com.pht.dev_edu.tracking.dto.CronJobEvent;

@ExtendWith(MockitoExtension.class)
class LectureSchedulerTest {

    @Mock
    private LectureService lectureService;

    @Mock
    private LectureRepository lectureRepository;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private DeleteProcessor batchDeleteProcessor;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private LectureScheduler lectureScheduler;

    @Test
    @DisplayName("cleanDeletedLectures - should execute batch delete job for deleted lectures")
    void shouldExecuteBatchDeleteJobForDeletedLectures() {
        // Arrange
        UUID id = UUID.randomUUID();
        when(lectureRepository.findDeletedIdsBeforeCutoffTime(any())).thenReturn(List.of(id));

        DeleteProcessor.BatchResult<UUID> result = new DeleteProcessor.BatchResult<>(List.of(id), Map.of());
        when(batchDeleteProcessor.processBatch(eq(List.of(id)), any())).thenReturn(result);

        // Act
        lectureScheduler.cleanDeletedLectures();

        // Verify
        verify(kafkaTemplate).send(any(), any(CronJobEvent.class));
    }
}
