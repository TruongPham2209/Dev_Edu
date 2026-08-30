package com.pht.dev_edu.notification.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.notification.dto.PushNotificationEvent;
import com.pht.dev_edu.notification.service.PushNotificationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

/**
 * Kafka event listener responsible for delivering real-time push notifications to user devices.
 *
 * <p>Consumes asynchronous push notification events and dispatches them via external push gateways
 * (e.g. Firebase Cloud Messaging - FCM, WebPush) to active user client devices and browser sessions.
 *
 * <p>Implements retry semantics with exponential backoff and dead-letter queue (DLQ) support
 * to handle transient network issues or FCM throttling.
 *
 * @author Dev_Edu Team
 * @see PushNotificationService
 * @see PushNotificationEvent
 */
@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PushNotificationEventListener {

    PushNotificationService pushNotificationService;
    ObjectMapper objectMapper;

    /**
     * Consumes and processes push notification events for instant user device notification.
     *
     * <p>Parses the push payload containing target user, title, body, and custom routing metadata,
     * then invokes {@link PushNotificationService#pushToUser(String, String, String, java.util.Map)}.
     *
     * <p><b>Topic:</b> {@link KafkaTopicConstant#PUSH_NOTIFICATION_TOPIC}<br>
     * <b>Retry Policy:</b> 3 attempts, initial delay 3000ms with multiplier 2.0. Unresolved messages
     * route to topic {@code <topic>-dlq}.
     *
     * @param payload JSON string representing a {@link PushNotificationEvent}
     * @param ack     manual Kafka commit acknowledgment
     * @throws JsonProcessingException if deserialization fails
     */
    @RetryableTopic(
            attempts = "3",
            backoff = @Backoff(delay = 3000, multiplier = 2),
            dltTopicSuffix = "-dlq"
    )
    @KafkaListener(
            topics = KafkaTopicConstant.PUSH_NOTIFICATION_TOPIC,
            groupId = KafkaTopicConstant.KAFKA_CONSUMER_GROUP
    )
    public void handlePushNotificationEvent(String payload, Acknowledgment ack) throws JsonProcessingException {
        log.info("Received push notification event from Kafka: {}", payload);
        var event = objectMapper.readValue(payload, PushNotificationEvent.class);

        pushNotificationService.pushToUser(
                event.getUsername(),
                event.getTitle(),
                event.getBody(),
                event.getData()
        );
        log.info("Processed push notification for user: {}", event.getUsername());

        ack.acknowledge();
    }
}
