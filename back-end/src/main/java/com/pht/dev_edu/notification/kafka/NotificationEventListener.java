package com.pht.dev_edu.notification.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.notification.dto.PersonalNotificationEvent;
import com.pht.dev_edu.notification.service.NotificationPersonalService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationEventListener {

    NotificationPersonalService notificationPersonalService;
    ObjectMapper objectMapper;

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
