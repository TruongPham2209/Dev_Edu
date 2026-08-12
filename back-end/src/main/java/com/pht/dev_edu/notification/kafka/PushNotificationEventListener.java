package com.pht.dev_edu.notification.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.notification.dto.PushNotificationEvent;
import com.pht.dev_edu.notification.service.PushNotificationService;
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
public class PushNotificationEventListener {

    PushNotificationService pushNotificationService;
    ObjectMapper objectMapper;

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
