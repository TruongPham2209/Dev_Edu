package com.pht.dev_edu.file.kafka;

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
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileEventListener {
    FileService fileService;
    ObjectMapper objectMapper;

    LectureRepository lectureRepository;

    @RetryableTopic(
            attempts = "5",
            backoff = @Backoff(delay = 5000, multiplier = 2),
            dltTopicSuffix = "-dlq"
    )
    @KafkaListener(topics = KafkaTopicConstant.FILE_DELETE_TOPIC, groupId = KafkaTopicConstant.KAFKA_CONSUMER_GROUP)
    public void handleFileDeleteEvent(String payload, Acknowledgment ack) throws JsonProcessingException {
        var event = objectMapper.readValue(payload, FileDeleteEvent.class);
        fileService.deleteFile(event.getFullObjectKey());
        log.info("Deleted file: {}", event.getFullObjectKey());

        ack.acknowledge();
    }

    @Transactional
    @RetryableTopic(
            attempts = "5",
            backoff = @Backoff(delay = 5000, multiplier = 2),
            dltTopicSuffix = "-dlq"
    )
    @KafkaListener(topics = KafkaTopicConstant.VIDEO_DURATION_EVENT_TOPIC, groupId = KafkaTopicConstant.KAFKA_CONSUMER_GROUP)
    public void handleVideoDurationEvent(String payload, Acknowledgment ack) throws JsonProcessingException {
        var event = objectMapper.readValue(payload, GetVideoDurationEvent.class);
        var duration = fileService.getVideoDuration(event.getObjectKey());
        log.info("Video duration for {}: {} seconds", event.getObjectKey(), duration);

        switch (event.getVideoType()) {
            case LECTURE -> lectureRepository.updateLectureVideoDuration(event.getEntityId(), duration);
//            case ASSIGNMENT -> fileService.updateAssignmentVideoDuration(event.getEntityId(), duration);
        }

        ack.acknowledge();
    }
}
