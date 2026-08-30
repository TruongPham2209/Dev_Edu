package com.pht.dev_edu.common.util;

import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.file.dto.FileDeleteEvent;
import com.pht.dev_edu.forum.document.PostDocument;
import com.pht.dev_edu.forum.dto.PostInteractiveData;
import com.pht.dev_edu.forum.entity.PostVersionEntity;
import com.pht.dev_edu.tracking.dto.TrackingEvent;
import com.pht.dev_edu.notification.dto.PersonalNotificationEvent;
import com.pht.dev_edu.notification.dto.PushNotificationEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.ZoneId;
import java.util.UUID;

/**
 * Static helper utility for publishing asynchronous events to Kafka topics across the application.
 */
@Component
public class KafkaUtils {

    private static KafkaTemplate<String, Object> kafkaTemplate;

    public KafkaUtils(KafkaTemplate<String, Object> kafkaTemplate) {
        KafkaUtils.kafkaTemplate = kafkaTemplate;
    }

    /**
     * Publishes a file deletion event to trigger asynchronous removal of objects from S3/R2 storage.
     *
     * @param objectKey the S3 storage object key to delete.
     */
    public static void sendDeleteFileEvent(String objectKey) {
        if (StringUtils.hasText(objectKey)) {
            kafkaTemplate.send(
                    KafkaTopicConstant.FILE_DELETE_TOPIC,
                    new FileDeleteEvent(objectKey)
            );
        }
    }

    /**
     * Publishes a user behavioral tracking event for telemetry processing.
     *
     * @param event the {@link TrackingEvent} payload.
     */
    public static void sendTrackingEvent(TrackingEvent event) {
        if (event != null) {
            kafkaTemplate.send(
                    KafkaTopicConstant.TRACKING_EVENT_TOPIC,
                    event
            );
        }
    }

    /**
     * Publishes a personal notification event to be recorded and sent to a user.
     *
     * @param event the {@link PersonalNotificationEvent} payload.
     */
    public static void sendPersonalNotificationEvent(PersonalNotificationEvent event) {
        if (event != null) {
            kafkaTemplate.send(
                    KafkaTopicConstant.PERSONAL_NOTIFICATION_TOPIC,
                    event
            );
        }
    }

    /**
     * Publishes a push notification event to dispatch Firebase Cloud Messaging (FCM) messages.
     *
     * @param event the {@link PushNotificationEvent} payload.
     */
    public static void sendPushNotificationEvent(PushNotificationEvent event) {
        if (event != null) {
            kafkaTemplate.send(
                    KafkaTopicConstant.PUSH_NOTIFICATION_TOPIC,
                    event
            );
        }
    }

    /**
     * Publishes an event to synchronize a published forum post version into Elasticsearch.
     *
     * @param entity   the {@link PostVersionEntity} containing updated post content.
     * @param username the username of the post author.
     */
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

    /**
     * Publishes an event to synchronize updated post interaction counters (likes, comments, views) into Elasticsearch.
     *
     * @param interactiveData the {@link PostInteractiveData} counters.
     */
    public static void sendSyncInteractivePostEvent(PostInteractiveData interactiveData) {
        if (interactiveData != null && interactiveData.getPostId() != null) {
            kafkaTemplate.send(KafkaTopicConstant.POST_INTERACT_ELASTIC_DATA_UPDATE_TOPIC, interactiveData);
        }
    }

    /**
     * Publishes an event to delete a forum post index from Elasticsearch.
     *
     * @param postId the UUID of the post to delete from the index.
     */
    public static void sendSyncPostDeleteEvent(UUID postId) {
        if (postId != null) {
            kafkaTemplate.send(KafkaTopicConstant.POST_ELASTIC_DATA_DELETE_TOPIC, postId);
        }
    }
}
