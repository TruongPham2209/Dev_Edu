package com.pht.dev_edu.quiz.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.quiz.dto.event.QuizAuditLogEvent;
import com.pht.dev_edu.quiz.dto.event.QuizAutosaveLogEvent;
import com.pht.dev_edu.quiz.entity.QuizAttemptAnswerEntity;
import com.pht.dev_edu.quiz.entity.QuizAttemptAnswerLogEntity;
import com.pht.dev_edu.quiz.entity.QuizAuditLogEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionEntity;
import com.pht.dev_edu.quiz.repo.QuizAttemptAnswerLogRepo;
import com.pht.dev_edu.quiz.repo.QuizAttemptAnswerRepo;
import com.pht.dev_edu.quiz.repo.QuizAuditLogRepo;
import com.pht.dev_edu.quiz.repo.QuizQuestionRepo;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizEventListener {
    QuizAuditLogRepo auditLogRepo;
    QuizAttemptAnswerLogRepo answerLogRepo;
    QuizAttemptAnswerRepo answerRepo;
    QuizQuestionRepo questionRepo;
    ObjectMapper objectMapper;

    @RetryableTopic(
            attempts = "3",
            backoff = @Backoff(delay = 5000, multiplier = 2),
            dltTopicSuffix = "-dlq"
    )
    @KafkaListener(topics = KafkaTopicConstant.QUIZ_AUDIT_LOG_TOPIC, groupId = KafkaTopicConstant.KAFKA_CONSUMER_GROUP)
    @Transactional
    public void handleAuditLogEvent(String payload, Acknowledgment ack) throws JsonProcessingException {
        log.debug("Received quiz audit log event: {}", payload);
        QuizAuditLogEvent event = objectMapper.readValue(payload, QuizAuditLogEvent.class);

        QuizAuditLogEntity auditLog = QuizAuditLogEntity.builder()
                .entityType(event.getEntityType())
                .entityId(event.getEntityId())
                .action(event.getAction())
                .performedBy(event.getPerformedBy())
                .oldValue(event.getOldValue())
                .newValue(event.getNewValue())
                .note(event.getNote())
                .createdAt(event.getCreatedAt())
                .build();

        auditLogRepo.save(auditLog);
        ack.acknowledge();
    }

    @RetryableTopic(
            attempts = "3",
            backoff = @Backoff(delay = 5000, multiplier = 2),
            dltTopicSuffix = "-dlq"
    )
    @KafkaListener(topics = KafkaTopicConstant.QUIZ_AUTOSAVE_LOG_TOPIC, groupId = KafkaTopicConstant.KAFKA_CONSUMER_GROUP)
    @Transactional
    public void handleAutosaveLogEvent(String payload, Acknowledgment ack) throws JsonProcessingException {
        log.debug("Received quiz autosave event: {}", payload);
        QuizAutosaveLogEvent event = objectMapper.readValue(payload, QuizAutosaveLogEvent.class);

        String selectedOptionIdsJson = null;
        if (event.getSelectedOptionIds() != null) {
            selectedOptionIdsJson = objectMapper.writeValueAsString(event.getSelectedOptionIds());
        }

        // 1. Insert append-only log into quiz_attempt_answer_logs
        QuizAttemptAnswerLogEntity answerLog = QuizAttemptAnswerLogEntity.builder()
                .attemptId(event.getAttemptId())
                .questionId(event.getQuestionId())
                .answerText(event.getAnswerText())
                .selectedOptionIds(selectedOptionIdsJson)
                .clientSeq(event.getClientSeq())
                .sessionToken(event.getSessionToken())
                .savedAt(event.getSavedAt())
                .build();

        answerLogRepo.save(answerLog);

        // 2. Upsert current state in quiz_attempt_answers
        Optional<QuizQuestionEntity> questionOpt = questionRepo.findByIdAndDeletedAtIsNull(event.getQuestionId());
        if (questionOpt.isPresent()) {
            QuizQuestionEntity question = questionOpt.get();
            Optional<QuizAttemptAnswerEntity> existingAnswerOpt = answerRepo.findByAttemptIdAndQuestionId(event.getAttemptId(), event.getQuestionId());

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
}
