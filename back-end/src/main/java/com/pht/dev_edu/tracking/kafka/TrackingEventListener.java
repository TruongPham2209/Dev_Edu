package com.pht.dev_edu.tracking.kafka;

import java.util.UUID;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Component;

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

/**
 * Kafka event listener handling asynchronous system tracking, audit metrics, transactional emails,
 * and Elasticsearch search index synchronization.
 *
 * <p>Consolidates consumers for multiple system-wide asynchronous workflows:
 * <ul>
 *   <li><b>User & Learning Tracking:</b> Student activity tracking, video watch progress, course interactions.</li>
 *   <li><b>Assignment Submissions:</b> Logging student submission timestamps, file attachments, and metadata.</li>
 *   <li><b>Cron Job Executions:</b> Background task execution monitoring and runtime telemetry.</li>
 *   <li><b>HTTP Request Audits:</b> Asynchronous access log aggregation.</li>
 *   <li><b>Email Notifications:</b> Asynchronous email delivery via Brevo / SMTP.</li>
 *   <li><b>Elasticsearch Synchronization:</b> Forum post CRUD indexing and interaction counter updates.</li>
 * </ul>
 *
 * <p>All listener methods utilize {@link RetryableTopic} with backoff policies and Dead Letter Queues (DLQ).
 *
 * @author Dev_Edu Team
 * @see LogService
 * @see SubmissionService
 * @see MailService
 * @see PostElasticService
 */
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

    /**
     * Consumes general user activity and learning behavior tracking events.
     *
     * <p><b>Topic:</b> {@link KafkaTopicConstant#TRACKING_EVENT_TOPIC}<br>
     * <b>Retry Policy:</b> 3 attempts, initial delay 5000ms with multiplier 2.0. DLQ enabled.
     *
     * @param payload JSON string representing {@link TrackingEvent}
     * @param ack     manual Kafka commit acknowledgment
     * @throws JsonProcessingException if deserialization fails
     */
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

    /**
     * Consumes assignment submission events and records submission audit logs.
     *
     * <p><b>Topic:</b> {@link KafkaTopicConstant#SUBMISSION_EVENT_TOPIC}<br>
     * <b>Retry Policy:</b> 3 attempts, initial delay 5000ms with multiplier 2.0. DLQ enabled.
     *
     * @param payload JSON string representing {@link SubmissionEvent}
     * @param ack     manual Kafka commit acknowledgment
     * @throws JsonProcessingException if deserialization fails
     */
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

    /**
     * Consumes scheduled cron job execution telemetry events and persists run history.
     *
     * <p><b>Topic:</b> {@link KafkaTopicConstant#CRON_JOB_EVENT_TOPIC}<br>
     * <b>Retry Policy:</b> 3 attempts, initial delay 5000ms with multiplier 2.0. DLQ enabled.
     *
     * @param payload JSON string representing {@link CronJobEvent}
     * @param ack     manual Kafka commit acknowledgment
     * @throws JsonProcessingException if deserialization fails
     */
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

    /**
     * Consumes HTTP request logging events for asynchronous access auditing.
     *
     * <p><b>Topic:</b> {@link KafkaTopicConstant#REQUEST_LOG_TOPIC}<br>
     * <b>Retry Policy:</b> 3 attempts, initial delay 5000ms with multiplier 2.0. DLQ enabled.
     *
     * @param payload JSON string representing {@link RequestLoggingEvent}
     * @param ack     manual Kafka commit acknowledgment
     * @throws JsonProcessingException if deserialization fails
     */
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

    /**
     * Consumes asynchronous email sending events and dispatches messages via {@link MailService}.
     *
     * <p><b>Topic:</b> {@link KafkaTopicConstant#MAIL_SEND_TOPIC}<br>
     * <b>Retry Policy:</b> 5 attempts, initial delay 5000ms with multiplier 2.0. DLQ enabled.
     *
     * @param payload JSON string representing {@link MailPayload}
     * @param ack     manual Kafka commit acknowledgment
     * @throws JsonProcessingException if deserialization fails
     */
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

    /**
     * Consumes forum post update events and synchronizes content to the Elasticsearch search index.
     *
     * <p><b>Topic:</b> {@link KafkaTopicConstant#POST_ELASTIC_DATA_UPDATE_TOPIC}<br>
     * <b>Retry Policy:</b> 5 attempts, initial delay 3000ms with multiplier 2.0. DLQ enabled.
     *
     * @param payload JSON string representing updated {@link PostDocument}
     * @param ack     manual Kafka commit acknowledgment
     * @throws JsonProcessingException if deserialization fails
     */
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

    /**
     * Consumes forum post interaction events (views, likes, comments) and updates counters in Elasticsearch.
     *
     * <p><b>Topic:</b> {@link KafkaTopicConstant#POST_INTERACT_ELASTIC_DATA_UPDATE_TOPIC}<br>
     * <b>Retry Policy:</b> 3 attempts, initial delay 3000ms with multiplier 2.0. DLQ enabled.
     *
     * @param payload JSON string representing {@link PostInteractiveData}
     * @param ack     manual Kafka commit acknowledgment
     * @throws JsonProcessingException if deserialization fails
     */
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

    /**
     * Consumes forum post deletion events and deletes the corresponding document from Elasticsearch.
     *
     * <p><b>Topic:</b> {@link KafkaTopicConstant#POST_ELASTIC_DATA_DELETE_TOPIC}<br>
     * <b>Retry Policy:</b> 5 attempts, initial delay 2000ms with multiplier 2.0. DLQ enabled.
     *
     * @param payload JSON string containing deleted post's {@link UUID}
     * @param ack     manual Kafka commit acknowledgment
     * @throws JsonProcessingException if deserialization fails
     */
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
