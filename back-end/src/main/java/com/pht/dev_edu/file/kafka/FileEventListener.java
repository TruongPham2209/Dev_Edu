package com.pht.dev_edu.file.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.file.dto.FileDeleteEvent;
import com.pht.dev_edu.file.service.FileService;
import com.pht.dev_edu.lecture.repo.LectureRepository;
import com.pht.dev_edu.tracking.dto.GetVideoDurationEvent;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

/**
 * Kafka event listener responsible for asynchronous file operations and metadata processing.
 *
 * <p>Handles background events published across the system for:
 * <ul>
 *   <li>Physical file deletion from object storage (S3 / MinIO).</li>
 *   <li>Video duration calculation and entity metadata updates.</li>
 * </ul>
 *
 * <p>Configured with topic-level retry mechanisms ({@link RetryableTopic}) using exponential
 * backoff and dead-letter queues (DLQ) for failed message handling.
 *
 * @author Dev_Edu Team
 * @see FileService
 * @see LectureRepository
 */
@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileEventListener {
    FileService fileService;
    ObjectMapper objectMapper;
    LectureRepository lectureRepository;

    /**
     * Consumes file deletion events from Kafka and purges the file from object storage.
     *
     * <p><b>Topic:</b> {@link KafkaTopicConstant#FILE_DELETE_TOPIC}<br>
     * <b>Retry Policy:</b> 5 attempts, initial delay 5000ms with multiplier 2.0. Unresolved messages
     * route to topic {@code <topic>-dlq}.
     *
     * @param payload JSON string containing {@link FileDeleteEvent} with target object key
     * @param ack     manual Kafka commit acknowledgment
     * @throws JsonProcessingException if the JSON payload is malformed
     */
    @RetryableTopic(attempts = "5", backoff = @Backoff(delay = 5000, multiplier = 2), dltTopicSuffix = "-dlq")
    @KafkaListener(topics = KafkaTopicConstant.FILE_DELETE_TOPIC, groupId = KafkaTopicConstant.KAFKA_CONSUMER_GROUP)
    public void handleFileDeleteEvent(String payload, Acknowledgment ack) throws JsonProcessingException {
        var event = objectMapper.readValue(payload, FileDeleteEvent.class);
        fileService.deleteFile(event.getFullObjectKey());
        log.info("Deleted file: {}", event.getFullObjectKey());

        ack.acknowledge();
    }

    /**
     * Consumes video duration retrieval events, probes the object storage for video length,
     * and updates the associated domain entity (e.g. Lecture or Assignment).
     *
     * <p><b>Topic:</b> {@link KafkaTopicConstant#VIDEO_DURATION_EVENT_TOPIC}<br>
     * <b>Retry Policy:</b> 5 attempts, initial delay 5000ms with multiplier 2.0. Unresolved messages
     * route to topic {@code <topic>-dlq}.
     *
     * @param payload JSON string containing {@link GetVideoDurationEvent} with entity ID and S3 object key
     * @param ack     manual Kafka commit acknowledgment
     * @throws JsonProcessingException if the JSON payload is malformed
     */
    @Transactional
    @RetryableTopic(attempts = "5", backoff = @Backoff(delay = 5000, multiplier = 2), dltTopicSuffix = "-dlq")
    @KafkaListener(topics = KafkaTopicConstant.VIDEO_DURATION_EVENT_TOPIC, groupId = KafkaTopicConstant.KAFKA_CONSUMER_GROUP)
    public void handleVideoDurationEvent(String payload, Acknowledgment ack) throws JsonProcessingException {
        var event = objectMapper.readValue(payload, GetVideoDurationEvent.class);
        var duration = fileService.getVideoDuration(event.getObjectKey());
        log.info("Video duration for {}: {} seconds", event.getObjectKey(), duration);

        switch (event.getVideoType()) {
            case LECTURE -> lectureRepository.updateLectureVideoDuration(event.getEntityId(), duration);
            case ASSIGNMENT -> log.info("The assignment video duration update will be supported in the future.");
        }

        ack.acknowledge();
    }
}
