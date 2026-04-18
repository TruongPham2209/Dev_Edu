package com.pht.dev_edu.tracking.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.assignment.dto.SubmissionEvent;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.tracking.dto.CronJobEvent;
import com.pht.dev_edu.tracking.dto.RequestLoggingEvent;
import com.pht.dev_edu.tracking.dto.TrackingEvent;
import com.pht.dev_edu.tracking.service.LogService;
import com.pht.dev_edu.tracking.service.SubmissionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TrackingEventListener {
    LogService logService;
    SubmissionService submissionService;
    ObjectMapper objectMapper;

    @RetryableTopic(
            attempts = "5",
            backoff = @Backoff(delay = 5000, multiplier = 2),
            dltTopicSuffix = "-dlq"
    )
    @KafkaListener(topics = KafkaTopicConstant.TRACKING_EVENT_TOPIC)
    public void handleTrackingEvent(String payload) throws JsonProcessingException {
        var event = objectMapper.readValue(payload, TrackingEvent.class);
        logService.saveLog(event);
    }

    @RetryableTopic(
            attempts = "5",
            backoff = @Backoff(delay = 5000, multiplier = 2),
            dltTopicSuffix = "-dlq"
    )
    @KafkaListener(topics = KafkaTopicConstant.SUBMISSION_EVENT_TOPIC)
    public void handleSubmissionEvent(String payload) throws JsonProcessingException {
        var event = objectMapper.readValue(payload, SubmissionEvent.class);
        submissionService.saveSubmissionLog(event);
    }

    @RetryableTopic(
            attempts = "5",
            backoff = @Backoff(delay = 5000, multiplier = 2),
            dltTopicSuffix = "-dlq"
    )
    @KafkaListener(topics = KafkaTopicConstant.TRACKING_EVENT_TOPIC)
    public void handleCronJobEvent(String payload) throws JsonProcessingException {
        var event = objectMapper.readValue(payload, CronJobEvent.class);
//        logService.saveLog(event);
    }

    @RetryableTopic(
            attempts = "5",
            backoff = @Backoff(delay = 5000, multiplier = 2),
            dltTopicSuffix = "-dlq"
    )
    @KafkaListener(topics = KafkaTopicConstant.TRACKING_EVENT_TOPIC)
    public void handleLogRequestEvent(String payload) throws JsonProcessingException {
        var event = objectMapper.readValue(payload, RequestLoggingEvent.class);

    }
}
