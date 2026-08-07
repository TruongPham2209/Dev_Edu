package com.pht.dev_edu.common.util;

import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.file.dto.FileDeleteEvent;
import com.pht.dev_edu.forum.document.PostDocument;
import com.pht.dev_edu.forum.dto.PostInteractiveData;
import com.pht.dev_edu.forum.entity.PostVersionEntity;
import com.pht.dev_edu.tracking.dto.TrackingEvent;
import com.pht.dev_edu.notification.dto.PersonalNotificationEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.ZoneId;
import java.util.UUID;

@Component
public class KafkaUtils {

    private static KafkaTemplate<String, Object> kafkaTemplate;

    public KafkaUtils(KafkaTemplate<String, Object> kafkaTemplate) {
        KafkaUtils.kafkaTemplate = kafkaTemplate;
    }

    public static void sendDeleteFileEvent(String objectKey) {
        if (StringUtils.hasText(objectKey)) {
            kafkaTemplate.send(
                    KafkaTopicConstant.FILE_DELETE_TOPIC,
                    new FileDeleteEvent(objectKey)
            );
        }
    }

    public static void sendTrackingEvent(TrackingEvent event) {
        if (event != null) {
            kafkaTemplate.send(
                    KafkaTopicConstant.TRACKING_EVENT_TOPIC,
                    event
            );
        }
    }

    public static void sendPersonalNotificationEvent(PersonalNotificationEvent event) {
        if (event != null && StringUtils.hasText(event.getUsername())) {
            kafkaTemplate.send(
                    KafkaTopicConstant.PERSONAL_NOTIFICATION_TOPIC,
                    event
            );
        }
    }

    public static void sendSyncPostEvent(PostVersionEntity entity, String username) {
        if (entity != null) {
            var zoneId = ZoneId.systemDefault();
            var document = PostDocument.builder()
                    .id(entity.getPostId())
                    .title(entity.getTitle())
                    .content(entity.getContent())
                    .shortDescription(entity.getShortDescription())
                    .thumbUrl(entity.getThumbUrl())
                    .authorUsername(username)
                    .createdAt(entity.getCreatedAt().atZone(zoneId).toInstant())
                    .updatedAt(entity.getUpdatedAt().atZone(zoneId).toInstant())
                    .build();
            kafkaTemplate.send(KafkaTopicConstant.POST_ELASTIC_DATA_UPDATE_TOPIC, document);
        }
    }

    public static void sendSyncInteractivePostEvent(PostInteractiveData interactiveData) {
        if (interactiveData != null && interactiveData.getPostId() != null) {
            kafkaTemplate.send(KafkaTopicConstant.POST_INTERACT_ELASTIC_DATA_UPDATE_TOPIC, interactiveData);
        }
    }

    public static void sendSyncPostDeleteEvent(UUID postId) {
        if (postId != null) {
            kafkaTemplate.send(KafkaTopicConstant.POST_ELASTIC_DATA_DELETE_TOPIC, postId);
        }
    }
}
