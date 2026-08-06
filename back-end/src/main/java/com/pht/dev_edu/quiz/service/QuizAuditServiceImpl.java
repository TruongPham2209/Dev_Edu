package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.quiz.dto.enums.QuizAuditAction;
import com.pht.dev_edu.quiz.dto.event.QuizAuditLogEvent;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizAuditServiceImpl implements QuizAuditService {
    KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public void log(String entityType, UUID entityId, QuizAuditAction action, String performedBy, Object oldValue, Object newValue, String note) {
        try {
            QuizAuditLogEvent event = QuizAuditLogEvent.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .action(action)
                    .performedBy(performedBy)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .note(note)
                    .createdAt(LocalDateTime.now())
                    .build();

            kafkaTemplate.send(KafkaTopicConstant.QUIZ_AUDIT_LOG_TOPIC, event);
            log.debug("Sent quiz audit log event to Kafka for entityId={}", entityId);
        } catch (Exception e) {
            log.error("Failed to publish quiz audit log event to Kafka for entityType={}, entityId={}, action={}: {}",
                    entityType, entityId, action, e.getMessage(), e);
        }
    }
}
