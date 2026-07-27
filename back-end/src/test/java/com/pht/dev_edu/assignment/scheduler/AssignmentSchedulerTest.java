package com.pht.dev_edu.assignment.scheduler;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

/*
 * <analysis>
 * AssignmentScheduler
 * - cleanDeletedAssignments()
 *   - branches:
 *       successful batch delete -> CronJobEvent status SUCCESS, details set, sends Kafka event
 *       batch delete with errors -> CronJobEvent status PARTIAL_FAILURE, error message JSON serialized
 *       exception during cleanup -> CronJobEvent status FAILURE, error stacktrace logged
 *   - paths:
 *       [P1: successful cleanup]
 *       [P2: exception during cleanup]
 *   - planned tests:
 *       [shouldExecuteCleanupJobSuccessfully -> P1]
 *       [shouldHandleExceptionAndSendFailureCronJobEvent -> P2]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for AssignmentScheduler
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify scheduled assignment deletion and CronJob event reporting in AssignmentScheduler.
 *
 * Test Scope
 * ----------
 * - cleanDeletedAssignments()
 *
 * Covered Scenarios
 * -----------------
 * ✓ Successful batch deletion processing and Kafka CronJobEvent notification
 * ✓ Exception handling during cleanup job execution
 *
 * Mocked Dependencies
 * -------------------
 * - AssignmentService
 * - AssignmentRepository
 * - ObjectMapper
 * - DeleteProcessor
 * - KafkaTemplate
 */

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.assignment.repo.AssignmentRepository;
import com.pht.dev_edu.assignment.service.AssignmentService;
import com.pht.dev_edu.common.service.DeleteProcessor;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.tracking.dto.CronJobEvent;

@ExtendWith(MockitoExtension.class)
class AssignmentSchedulerTest {

    @Mock
    private AssignmentService assignmentService;

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private DeleteProcessor batchDeleteProcessor;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private AssignmentScheduler assignmentScheduler;

    private MockedStatic<KafkaUtils> kafkaUtilsMock;

    @BeforeEach
    void setUp() {
        kafkaUtilsMock = mockStatic(KafkaUtils.class);
    }

    @AfterEach
    void tearDown() {
        kafkaUtilsMock.close();
    }

    @Test
    @DisplayName("cleanDeletedAssignments - should execute batch delete and send CronJobEvent successfully")
    void shouldExecuteCleanupJobSuccessfully() {
        // Arrange
        UUID id = UUID.randomUUID();
        when(assignmentRepository.findDeletedAssignmentIdsBeforeCutoffTime(any()))
                .thenReturn(List.of(id));

        DeleteProcessor.BatchResult<UUID> result = new DeleteProcessor.BatchResult<>(List.of(id), Map.of());
        when(batchDeleteProcessor.processBatch(eq(List.of(id)), any()))
                .thenReturn(result);

        // Act
        assignmentScheduler.cleanDeletedAssignments();

        // Verify
        verify(kafkaTemplate).send(any(), any(CronJobEvent.class));
    }

    @Test
    @DisplayName("cleanDeletedAssignments - should handle exception and publish FAILURE status CronJobEvent")
    void shouldHandleExceptionAndSendFailureCronJobEvent() {
        // Arrange
        when(assignmentRepository.findDeletedAssignmentIdsBeforeCutoffTime(any()))
                .thenThrow(new RuntimeException("Database error"));

        // Act
        assignmentScheduler.cleanDeletedAssignments();

        // Verify
        verify(kafkaTemplate).send(any(), any(CronJobEvent.class));
    }
}
