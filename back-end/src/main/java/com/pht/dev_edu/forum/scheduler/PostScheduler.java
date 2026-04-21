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
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostScheduler {
    KafkaTemplate<String, Object> kafkaTemplate;

    private static final long DELETION_DELAY_DAYS = 30;

    @Scheduled(fixedDelay = 60 * 60 * 1000)
    @Transactional
    public void cleanDeletedPosts() {
        // TODO: Implement logic to find posts marked for deletion and delete them if they have been marked for more than DELETION_DELAY_DAYS
    }
}
