package com.pht.dev_edu.notification.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.notification.dto.PersonalNotificationEvent;
import com.pht.dev_edu.notification.service.NotificationPersonalService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

/**
 * Kafka event listener responsible for persisting personalized user notifications.
 *
 * <p>Consumes asynchronous notification events triggered by various system domain actions
 * (e.g. grading updates, enrollment notifications, assignment deadlines, system alerts)
 * and stores them in the database for in-app inbox display.
 *
 * <p>Implements automated retries ({@link RetryableTopic}) with exponential backoff and dead-letter
 * topic (DLQ) routing for fault tolerance.
 *
 * @author Dev_Edu Team
 * @see NotificationPersonalService
 * @see PersonalNotificationEvent
 */
@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationEventListener {

    NotificationPersonalService notificationPersonalService;
    ObjectMapper objectMapper;

    /**
     * Handles incoming personal notification events from Kafka.
     *
     * <p>Parses the event payload, creates or updates personal notification records in the database,
     * and acknowledges message processing upon success.
     *
     * <p><b>Topic:</b> {@link KafkaTopicConstant#PERSONAL_NOTIFICATION_TOPIC}<br>
     * <b>Retry Policy:</b> 3 attempts, initial delay 3000ms with multiplier 2.0. Unresolved messages
     * route to topic {@code <topic>-dlq}.
     *
     * @param payload JSON string representing a {@link PersonalNotificationEvent}
     * @param ack     manual Kafka commit acknowledgment
     * @throws JsonProcessingException if deserialization fails
     */
    @RetryableTopic(
            attempts = "3",
            backoff = @Backoff(delay = 3000, multiplier = 2),
            dltTopicSuffix = "-dlq"
    )
    @KafkaListener(
            topics = KafkaTopicConstant.PERSONAL_NOTIFICATION_TOPIC,
            groupId = KafkaTopicConstant.KAFKA_CONSUMER_GROUP
    )
    public void handlePersonalNotificationEvent(String payload, Acknowledgment ack) throws JsonProcessingException {
        log.info("Received personal notification event from Kafka: {}", payload);
        var event = objectMapper.readValue(payload, PersonalNotificationEvent.class);

        // Save personal notification into DB
        notificationPersonalService.saveFromEvent(event);
        log.info("Saved personal notification for user: {}", event.getUsername());

        ack.acknowledge();
    }
}
