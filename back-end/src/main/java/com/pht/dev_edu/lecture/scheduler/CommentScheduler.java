package com.pht.dev_edu.lecture.scheduler;

import com.pht.dev_edu.common.constant.CronJobConstant;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.lecture.repo.LectureCommentRepository;
import com.pht.dev_edu.tracking.dto.CronJobEvent;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component("lectureCommentScheduler")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommentScheduler {
    LectureCommentRepository lectureCommentRepository;
    KafkaTemplate<String, Object> kafkaTemplate;

    private static final long DELETION_DELAY_DAYS = 7;

    // Run every hour to clean up deleted comments that are older than the specified delay
    @Scheduled(fixedDelay = 60 * 60 * 1000)
    @Transactional
    public void cleanDeletedComments() {
        var cutoffTime = LocalDateTime.now().minusDays(DELETION_DELAY_DAYS);
        var deletedCount = lectureCommentRepository.deleteByDeletedAtBefore(cutoffTime);

        var conJobEvent = CronJobEvent.builder()
                .cronJobName(CronJobConstant.CLEAN_DELETED_LECTURE_COMMENTS_JOB)
                .details("Deleted " + deletedCount + " lecture comments.")
                .build();
        kafkaTemplate.send(KafkaTopicConstant.CRON_JOB_EVENT_TOPIC, conJobEvent);
    }
}
