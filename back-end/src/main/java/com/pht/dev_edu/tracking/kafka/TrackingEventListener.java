package com.pht.dev_edu.tracking.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.assignment.dto.SubmissionEvent;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.common.service.MailService;
import com.pht.dev_edu.forum.document.PostDocument;
import com.pht.dev_edu.forum.dto.PostInteractiveData;
import com.pht.dev_edu.forum.service.PostElasticService;
import com.pht.dev_edu.tracking.dto.CronJobEvent;
import com.pht.dev_edu.tracking.dto.RequestLoggingEvent;
import com.pht.dev_edu.tracking.dto.TrackingEvent;
import com.pht.dev_edu.tracking.service.LogService;
import com.pht.dev_edu.tracking.service.SubmissionService;
import com.pht.dev_edu.user.dto.MailPayload;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TrackingEventListener {
    LogService logService;
    SubmissionService submissionService;
    MailService mailService;
    PostElasticService postElasticService;

    ObjectMapper objectMapper;

    @RetryableTopic(
            attempts = "3",
            backoff = @Backoff(delay = 5000, multiplier = 2),
            dltTopicSuffix = "-dlq"
    )
    @KafkaListener(topics = KafkaTopicConstant.TRACKING_EVENT_TOPIC, groupId = KafkaTopicConstant.KAFKA_CONSUMER_GROUP)
    public void handleTrackingEvent(String payload, Acknowledgment ack) throws JsonProcessingException {
        var event = objectMapper.readValue(payload, TrackingEvent.class);
        logService.saveTrackingLog(event);

        ack.acknowledge();
    }

    @RetryableTopic(
            attempts = "3",
            backoff = @Backoff(delay = 5000, multiplier = 2),
            dltTopicSuffix = "-dlq"
    )
    @KafkaListener(topics = KafkaTopicConstant.SUBMISSION_EVENT_TOPIC, groupId = KafkaTopicConstant.KAFKA_CONSUMER_GROUP)
    public void handleSubmissionEvent(String payload, Acknowledgment ack) throws JsonProcessingException {
        var event = objectMapper.readValue(payload, SubmissionEvent.class);
        submissionService.saveSubmissionLog(event);

        ack.acknowledge();
    }

    @RetryableTopic(
            attempts = "3",
            backoff = @Backoff(delay = 5000, multiplier = 2),
            dltTopicSuffix = "-dlq"
    )
    @KafkaListener(topics = KafkaTopicConstant.CRON_JOB_EVENT_TOPIC, groupId = KafkaTopicConstant.KAFKA_CONSUMER_GROUP)
    public void handleCronJobEvent(String payload, Acknowledgment ack) throws JsonProcessingException {
        var event = objectMapper.readValue(payload, CronJobEvent.class);
        logService.saveCronJobLog(event);

        ack.acknowledge();
    }

    @RetryableTopic(
            attempts = "3",
            backoff = @Backoff(delay = 5000, multiplier = 2),
            dltTopicSuffix = "-dlq"
    )
    @KafkaListener(topics = KafkaTopicConstant.REQUEST_LOG_TOPIC, groupId = KafkaTopicConstant.KAFKA_CONSUMER_GROUP)
    public void handleLogRequestEvent(String payload, Acknowledgment ack) throws JsonProcessingException {
        var event = objectMapper.readValue(payload, RequestLoggingEvent.class);
        logService.saveRequestLog(event);

        ack.acknowledge();
    }

    @RetryableTopic(
            attempts = "5",
            backoff = @Backoff(delay = 5000, multiplier = 2),
            dltTopicSuffix = "-dlq"
    )
    @KafkaListener(topics = KafkaTopicConstant.MAIL_SEND_TOPIC, groupId = KafkaTopicConstant.KAFKA_CONSUMER_GROUP)
    public void handleSendMailEvent(String payload, Acknowledgment ack) throws JsonProcessingException {
        var event = objectMapper.readValue(payload, MailPayload.class);
        var mailPayload = com.pht.dev_edu.common.dto.MailPayload.builder()
                .toMail(event.getToMail())
                .mailAttributes(event.getMailAttributes())
                .fileAttributes(event.getFileAttributes())
                .subject(event.getSubject().getValue())
                .template(event.getTemplate().getValue())
                .build();
        mailService.sendMail(mailPayload);

        ack.acknowledge();
    }

    @RetryableTopic(
            attempts = "5",
            backoff = @Backoff(delay = 3000, multiplier = 2),
            dltTopicSuffix = "-dlq"
    )
    @KafkaListener(topics = KafkaTopicConstant.POST_ELASTIC_DATA_UPDATE_TOPIC, groupId = KafkaTopicConstant.KAFKA_CONSUMER_GROUP)
    public void syncPostUpdateEvent(String payload, Acknowledgment ack) throws JsonProcessingException {
        var event = objectMapper.readValue(payload, PostDocument.class);
        postElasticService.upsertPostContent(event);

        ack.acknowledge();
    }

    @RetryableTopic(
            attempts = "3",
            backoff = @Backoff(delay = 3000, multiplier = 2),
            dltTopicSuffix = "-dlq"
    )
    @KafkaListener(topics = KafkaTopicConstant.POST_INTERACT_ELASTIC_DATA_UPDATE_TOPIC, groupId = KafkaTopicConstant.KAFKA_CONSUMER_GROUP)
    public void syncPostInteractiveUpdateEvent(String payload, Acknowledgment ack) throws JsonProcessingException {
        var interactiveData = objectMapper.readValue(payload, PostInteractiveData.class);
        postElasticService.updateInteractiveData(interactiveData);

        ack.acknowledge();
    }

    @RetryableTopic(
            attempts = "5",
            backoff = @Backoff(delay = 2000, multiplier = 2),
            dltTopicSuffix = "-dlq"
    )
    @KafkaListener(topics = KafkaTopicConstant.POST_ELASTIC_DATA_DELETE_TOPIC, groupId = KafkaTopicConstant.KAFKA_CONSUMER_GROUP)
    public void syncPostDeleteEvent(String payload, Acknowledgment ack) throws JsonProcessingException {
        var postId = objectMapper.readValue(payload, UUID.class);
        postElasticService.deletePost(postId);

        ack.acknowledge();
    }
}
