package com.pht.dev_edu.forum.scheduler;

import com.pht.dev_edu.common.constant.CronJobConstant;
import com.pht.dev_edu.common.service.DeleteProcessor;
import com.pht.dev_edu.forum.repo.PostRepository;
import com.pht.dev_edu.forum.repo.PostVersionRepository;
import com.pht.dev_edu.forum.repo.SavedPostRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostScheduler {
    PostRepository postRepository;
    PostVersionRepository postVersionRepository;
    SavedPostRepository savedPostRepository;
    DeleteProcessor deleteProcessor;

    private static final long DELETION_DELAY_DAYS = 30;

    @Scheduled(fixedDelay = 6 * 60 * 60 * 1000)
    @Transactional
    public void cleanDeletedPosts() {
        var cutoffTime = LocalDateTime.now().minusDays(DELETION_DELAY_DAYS);

        deleteProcessor.executeCleanupJob(
                CronJobConstant.CLEAN_DELETED_FORUM_POSTS_JOB,
                () -> postRepository
                        .deleteByDeletedAtIsBefore(cutoffTime),
                "Deleted %d posts"
        );
    }

    @Scheduled(fixedDelay = 12 * 60 * 60 * 1000)
    @Transactional
    public void cleanDeletedPostVersions() {
        deleteProcessor.executeCleanupJob(
                CronJobConstant.CLEAN_DELETED_FORUM_POSTS_JOB,
                () -> {
                    var deletedIds = postVersionRepository.deleteByInvalidPost();
                    return deletedIds.size();
                },
                "Deleted %d post versions with invalid post reference"
        );
    }

    @Scheduled(fixedDelay = 12 * 60 * 60 * 1000)
    @Transactional
    public void cleanSavePosts() {
        deleteProcessor.executeCleanupJob(
                CronJobConstant.CLEAN_DELETED_FORUM_POSTS_JOB,
                () -> {
                    var deletedIds = savedPostRepository.deleteByInvalidPostReference();
                    return deletedIds.size();
                },
                "Deleted %d saved posts with invalid post reference"
        );
    }
}
