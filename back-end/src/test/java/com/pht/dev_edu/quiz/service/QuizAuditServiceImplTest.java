package com.pht.dev_edu.quiz.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.quiz.dto.enums.QuizAuditAction;
import com.pht.dev_edu.quiz.dto.event.QuizAuditLogEvent;

/*
 * <analysis>
 * QuizAuditServiceImpl
 * - log(String entityType, UUID entityId, QuizAuditAction action, String performedBy, Object oldValue, Object newValue, String note)
 *   - branches:
 *       successful kafka send -> publishes event
 *       kafka throw exception -> catches exception and logs error without rethrowing
 *   - paths:
 *       [P1: successful audit log send]
 *       [P2: kafka exception caught]
 *   - planned tests:
 *       [log_SendsQuizAuditLogEventToKafkaTopic -> P1]
 *       [log_WhenKafkaThrowsException_CatchesExceptionAndLogsError -> P2]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for QuizAuditServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify publishing of quiz audit logs to Kafka topic.
 *
 * Test Scope
 * ----------
 * - log(String, UUID, QuizAuditAction, String, Object, Object, String)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Successful publication of QuizAuditLogEvent to QUIZ_AUDIT_LOG_TOPIC
 * ✓ Exception safety when Kafka publication fails
 *
 * Mocked Dependencies
 * -------------------
 * - KafkaTemplate
 */
@ExtendWith(MockitoExtension.class)
class QuizAuditServiceImplTest {

    @Mock
    KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    QuizAuditServiceImpl auditService;

    private UUID entityId;

    @BeforeEach
    void setUp() {
        entityId = UUID.randomUUID();
    }

    @Test
    @DisplayName("log - should send QuizAuditLogEvent to Kafka topic")
    void log_SendsQuizAuditLogEventToKafkaTopic() {
        auditService.log("QUIZ", entityId, QuizAuditAction.CREATE_QUIZ, "admin", null, "newVal", "Created quiz");

        verify(kafkaTemplate).send(eq(KafkaTopicConstant.QUIZ_AUDIT_LOG_TOPIC), any(QuizAuditLogEvent.class));
    }

    @Test
    @DisplayName("log - when Kafka throws exception, should catch exception without throwing")
    void log_WhenKafkaThrowsException_CatchesExceptionAndLogsError() {
        doThrow(new RuntimeException("Kafka error")).when(kafkaTemplate).send(any(), any());

        auditService.log("QUIZ", entityId, QuizAuditAction.CREATE_QUIZ, "admin", null, "newVal", "Created quiz");

        verify(kafkaTemplate).send(eq(KafkaTopicConstant.QUIZ_AUDIT_LOG_TOPIC), any(QuizAuditLogEvent.class));
    }
}
