package com.pht.dev_edu.file.scheduler;

import com.pht.dev_edu.common.constant.CronJobConstant;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.tracking.dto.CronJobEvent;
import com.pht.dev_edu.file.repo.FileUploadRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileScheduler {
    FileUploadRepository fileUploadRepository;
    KafkaTemplate<String, Object> kafkaTemplate;

    private static final long TIME_EXTEND_MINUTES = 1;

    // Run every 5 minutes to clean up expired and failed files
    @Scheduled(fixedDelay = 5 * 60 * 1000)
    public void cleanExpiredAndFailedFiles() {
        var objectKeys = fileUploadRepository.deleteExpiredAndFailedFiles(java.time.LocalDateTime.now().minusDays(TIME_EXTEND_MINUTES));
        for (String objectKey : objectKeys) {
            KafkaUtils.sendDeleteFileEvent(objectKey);
        }

        var conJobEvent = CronJobEvent.builder()
                .cronJobName(CronJobConstant.CLEAN_EXPIRED_AND_FAILED_FILES_JOB)
                .details("Deleted " + objectKeys.size() + " expired/failed files: " + objectKeys)
                .build();
        kafkaTemplate.send(KafkaTopicConstant.CRON_JOB_EVENT_TOPIC, conJobEvent);
    }
}
