package com.pht.dev_edu.quiz.kafka;

import java.util.Optional;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.quiz.dto.event.QuizAuditLogEvent;
import com.pht.dev_edu.quiz.dto.event.QuizAutosaveLogEvent;
import com.pht.dev_edu.quiz.entity.QuizAttemptAnswerEntity;
import com.pht.dev_edu.quiz.entity.QuizAttemptAnswerLogEntity;
import com.pht.dev_edu.quiz.entity.QuizAuditLogEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionEntity;
import com.pht.dev_edu.quiz.mapper.QuizMapper;
import com.pht.dev_edu.quiz.repo.QuizAttemptAnswerLogRepo;
import com.pht.dev_edu.quiz.repo.QuizAttemptAnswerRepo;
import com.pht.dev_edu.quiz.repo.QuizAuditLogRepo;
import com.pht.dev_edu.quiz.repo.QuizQuestionRepo;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

/**
 * Kafka event listener responsible for asynchronous quiz audit trail recording and real-time autosave persistence.
 *
 * <p>Key responsibilities:
 * <ul>
 *   <li><b>Audit Logging:</b> Ingests asynchronous administrative and user audit events (quiz creation,
 *       approval, rejection, grade updates) and persists immutable audit trail records in PostgreSQL.</li>
 *   <li><b>Attempt Autosaving:</b> Ingests high-throughput student question answer selections during live quiz
 *       attempts, appends an immutable client-sequenced log ({@link QuizAttemptAnswerLogEntity}), and upserts
 *       the current working answer state ({@link QuizAttemptAnswerEntity}) for recovery and grading.</li>
 * </ul>
 *
 * <p>Configured with retry topics ({@link RetryableTopic}) and exponential backoff to ensure zero data loss
 * under peak assessment load.
 *
 * @author Dev_Edu Team
 * @see QuizAuditLogRepo
 * @see QuizAttemptAnswerLogRepo
 * @see QuizAttemptAnswerRepo
 * @see QuizMapper
 */
@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizEventListener {
    QuizAuditLogRepo auditLogRepo;
    QuizAttemptAnswerLogRepo answerLogRepo;
    QuizAttemptAnswerRepo answerRepo;
    QuizQuestionRepo questionRepo;
    QuizMapper quizMapper;
    ObjectMapper objectMapper;

    /**
     * Consumes quiz audit log events and records immutable audit trail entries in the database.
     *
     * <p>Handles JSON serialization of complex {@code oldValue} / {@code newValue} state diffs
     * and maps the event to {@link QuizAuditLogEntity} via {@link QuizMapper}.
     *
     * <p><b>Topic:</b> {@link KafkaTopicConstant#QUIZ_AUDIT_LOG_TOPIC}<br>
     * <b>Retry Policy:</b> 3 attempts, initial delay 5000ms with multiplier 2.0. Dead-letter queue on failure.
     *
     * @param payload JSON string representing {@link QuizAuditLogEvent}
     * @param ack     manual Kafka commit acknowledgment
     * @throws JsonProcessingException if payload deserialization fails
     */
    @RetryableTopic(attempts = "3", backoff = @Backoff(delay = 5000, multiplier = 2), dltTopicSuffix = "-dlq")
    @KafkaListener(topics = KafkaTopicConstant.QUIZ_AUDIT_LOG_TOPIC, groupId = KafkaTopicConstant.KAFKA_CONSUMER_GROUP)
    @Transactional
    public void handleAuditLogEvent(String payload, Acknowledgment ack) throws JsonProcessingException {
        log.debug("Received quiz audit log event: {}", payload);
        String cleanPayload = unwrapJsonString(payload);
        QuizAuditLogEvent event = objectMapper.readValue(cleanPayload, QuizAuditLogEvent.class);

        String oldValueStr = null;
        if (event.getOldValue() != null) {
            oldValueStr = event.getOldValue() instanceof String ? (String) event.getOldValue()
                    : objectMapper.writeValueAsString(event.getOldValue());
        }

        String newValueStr = null;
        if (event.getNewValue() != null) {
            newValueStr = event.getNewValue() instanceof String ? (String) event.getNewValue()
                    : objectMapper.writeValueAsString(event.getNewValue());
        }

        QuizAuditLogEntity auditLog = quizMapper.toAuditLogEntity(event, oldValueStr, newValueStr);

        auditLogRepo.save(auditLog);
        ack.acknowledge();
    }

    /**
     * Consumes student answer autosave events during quiz execution.
     *
     * <p>Performs a dual-write operation within an atomic transaction:
     * <ol>
     *   <li><b>Append-only history:</b> Appends a new timestamped log record in {@code quiz_attempt_answer_logs}
     *       tracking client sequence number and selected options.</li>
     *   <li><b>Latest state snapshot:</b> Upserts the current answer state in {@code quiz_attempt_answers},
     *       updating option IDs, answer text, autosave sequence version, and timestamp.</li>
     * </ol>
     *
     * <p><b>Topic:</b> {@link KafkaTopicConstant#QUIZ_AUTOSAVE_LOG_TOPIC}<br>
     * <b>Retry Policy:</b> 3 attempts, initial delay 5000ms with multiplier 2.0. Dead-letter queue on failure.
     *
     * @param payload JSON string representing {@link QuizAutosaveLogEvent}
     * @param ack     manual Kafka commit acknowledgment
     * @throws JsonProcessingException if payload parsing or option JSON serialization fails
     */
    @RetryableTopic(attempts = "3", backoff = @Backoff(delay = 5000, multiplier = 2), dltTopicSuffix = "-dlq")
    @KafkaListener(topics = KafkaTopicConstant.QUIZ_AUTOSAVE_LOG_TOPIC, groupId = KafkaTopicConstant.KAFKA_CONSUMER_GROUP)
    @Transactional
    public void handleAutosaveLogEvent(String payload, Acknowledgment ack) throws JsonProcessingException {
        log.debug("Received quiz autosave event: {}", payload);
        String cleanPayload = unwrapJsonString(payload);
        QuizAutosaveLogEvent event = objectMapper.readValue(cleanPayload, QuizAutosaveLogEvent.class);

        String selectedOptionIdsJson = null;
        if (event.getSelectedOptionIds() != null) {
            selectedOptionIdsJson = objectMapper.writeValueAsString(event.getSelectedOptionIds());
        }

        // 1. Insert append-only log into quiz_attempt_answer_logs
        QuizAttemptAnswerLogEntity answerLog = quizMapper.toAnswerLogEntity(event, selectedOptionIdsJson);

        answerLogRepo.save(answerLog);

        // 2. Upsert current state in quiz_attempt_answers
        Optional<QuizQuestionEntity> questionOpt = questionRepo.findByIdAndDeletedAtIsNull(event.getQuestionId());
        if (questionOpt.isPresent()) {
            QuizQuestionEntity question = questionOpt.get();
            Optional<QuizAttemptAnswerEntity> existingAnswerOpt = answerRepo
                    .findByAttemptIdAndQuestionId(event.getAttemptId(), event.getQuestionId());

            QuizAttemptAnswerEntity answer = existingAnswerOpt.orElseGet(() -> QuizAttemptAnswerEntity.builder()
                    .attemptId(event.getAttemptId())
                    .questionId(event.getQuestionId())
                    .questionType(question.getQuestionType())
                    .autosaveVersion(0)
                    .build());

            answer.setAnswerText(event.getAnswerText());
            answer.setSelectedOptionIds(selectedOptionIdsJson);
            answer.setAutosaveVersion(event.getClientSeq());
            answer.setLastSavedAt(event.getSavedAt());

            answerRepo.save(answer);
        } else {
            log.warn("Question not found for autosave event: questionId={}", event.getQuestionId());
        }

        ack.acknowledge();
    }

    /**
     * Unwraps double-escaped or quoted JSON strings produced by certain Kafka producer configurations.
     *
     * @param raw the raw JSON string
     * @return clean unwrapped JSON string
     */
    private String unwrapJsonString(String raw) {
        if (raw == null)
            return null;
        String s = raw.trim();
        while (s.startsWith("\"") && s.endsWith("\"") && s.length() > 2) {
            try {
                String unescaped = objectMapper.readValue(s, String.class);
                if (unescaped == null || unescaped.equals(s))
                    break;
                s = unescaped.trim();
            } catch (Exception e) {
                break;
            }
        }
        return s;
    }
}
