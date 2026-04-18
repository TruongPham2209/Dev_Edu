package com.pht.dev_edu.course.scheduler;

import com.pht.dev_edu.common.constant.CronJobConstant;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.common.util.KafkaUtil;
import com.pht.dev_edu.course.repo.CourseRepository;
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
public class CourseScheduler {
    CourseRepository courseRepository;
    KafkaTemplate<String, Object> kafkaTemplate;

    private static final long DELETION_DELAY_DAYS = 30;

    // Run every hour to clean up deleted assignments and their associated files
    @Scheduled(fixedDelay = 60 * 60 * 1000)
    @Transactional
    public void cleanDeletedCourses() {
        var cutoffTime = LocalDateTime.now().minusDays(DELETION_DELAY_DAYS);
        var objectKeys = courseRepository.deleteCoursesBeforeCutoffTimeAndReturnObjectKey(cutoffTime);

        var conJobEvent = CronJobEvent.builder()
                .cronJobName(CronJobConstant.CLEAN_DELETED_COURSES_JOB)
                .details("Deleted " + objectKeys + " courses.")
                .build();
        kafkaTemplate.send(KafkaTopicConstant.CRON_JOB_EVENT_TOPIC, conJobEvent);

        for (String objectKey : objectKeys) {
            KafkaUtil.sendDeleteFileEvent(objectKey);
        }
    }
}
