package com.pht.dev_edu.forum.scheduler;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component("forumCommentScheduler")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommentScheduler {
    KafkaTemplate<String, Object> kafkaTemplate;

    private static final long DELETION_DELAY_DAYS = 7;

    @Scheduled(fixedDelay = 60 * 60 * 1000)
    @Transactional
    public void cleanDeletedComments() {

    }
}
