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

/**
 * Scheduled background tasks for forum posts, post versions, and bookmarks maintenance.
 */
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

    /**
     * Cleans up forum posts that were soft-deleted more than 30 days ago.
     * Runs every 6 hours.
     */
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

    /**
     * Cleans up orphaned post versions whose main post entity was removed, deleting thumbnail images from S3.
     * Runs every 12 hours.
     */
    @Scheduled(fixedDelay = 12 * 60 * 60 * 1000)
    @Transactional
    public void cleanDeletedPostVersions() {
        deleteProcessor.executeCleanupJobHasObjectKeys(
                CronJobConstant.CLEAN_DELETED_FORUM_POSTS_JOB,
                postVersionRepository::deleteByInvalidPostThenReturnObjectKeys,
                "Deleted %d post versions with invalid post reference"
        );
    }

    /**
     * Cleans up orphaned saved post bookmarks referring to deleted posts.
     * Runs every 12 hours.
     */
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
