package com.pht.dev_edu.course.scheduler;

import com.pht.dev_edu.common.constant.CronJobConstant;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.common.util.KafkaUtil;
import com.pht.dev_edu.course.repo.CategoryRepository;
import com.pht.dev_edu.tracking.dto.CronJobEvent;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryScheduler {
    CategoryRepository categoryRepository;
    KafkaTemplate<String, Object> kafkaTemplate;

    private static final long DELETION_DELAY_DAYS = 30;

    // Run every hour to clean up deleted assignments and their associated files
    @Scheduled(fixedDelay = 60 * 60 * 1000)
    @Transactional
    public void cleanDeletedAssignments() {
        var cutoffTime = LocalDateTime.now().minusDays(DELETION_DELAY_DAYS);
        var objectKeys = categoryRepository.deleteCategoriesBeforeCutoffTimeAndReturnObjectKey(cutoffTime);

        var conJobEvent = CronJobEvent.builder()
                .cronJobName(CronJobConstant.CLEAN_DELETED_CATEGORIES_JOB)
                .details("Deleted " + objectKeys + " categories.")
                .build();
        kafkaTemplate.send(KafkaTopicConstant.CRON_JOB_EVENT_TOPIC, conJobEvent);

        for (String objectKey : objectKeys) {
            KafkaUtil.sendDeleteFileEvent(objectKey);
        }
    }
}
