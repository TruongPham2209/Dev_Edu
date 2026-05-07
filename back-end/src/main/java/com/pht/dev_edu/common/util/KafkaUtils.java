package com.pht.dev_edu.common.util;

import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.file.dto.FileDeleteEvent;
import com.pht.dev_edu.tracking.dto.TrackingEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

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
}
