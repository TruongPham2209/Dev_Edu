package com.pht.dev_edu.forum.scheduler;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/*
 * <analysis>
 * PostScheduler
 * - cleanDeletedPosts()
 *   - paths:
 *       [P1: executes cleanup job on deleteProcessor for deleted posts]
 *   - planned tests:
 *       [shouldExecuteCleanupJobForDeletedPosts -> P1]
 *
 * - cleanDeletedPostVersions()
 *   - paths:
 *       [P1: executes cleanup job with object keys on deleteProcessor]
 *   - planned tests:
 *       [shouldExecuteCleanupJobForDeletedPostVersions -> P1]
 *
 * - cleanSavePosts()
 *   - paths:
 *       [P1: executes cleanup job on deleteProcessor for invalid saved posts]
 *   - planned tests:
 *       [shouldExecuteCleanupJobForSavedPosts -> P1]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for PostScheduler
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify cleanup task execution in PostScheduler.
 *
 * Test Scope
 * ----------
 * - cleanDeletedPosts()
 * - cleanDeletedPostVersions()
 * - cleanSavePosts()
 *
 * Covered Scenarios
 * -----------------
 * ✓ Invoking deleteProcessor cleanup jobs for posts, post versions, and saved posts
 *
 * Mocked Dependencies
 * -------------------
 * - PostRepository
 * - PostVersionRepository
 * - SavedPostRepository
 * - DeleteProcessor
 */

import com.pht.dev_edu.common.constant.CronJobConstant;
import com.pht.dev_edu.common.service.DeleteProcessor;
import com.pht.dev_edu.forum.repo.PostRepository;
import com.pht.dev_edu.forum.repo.PostVersionRepository;
import com.pht.dev_edu.forum.repo.SavedPostRepository;

@ExtendWith(MockitoExtension.class)
class PostSchedulerTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private PostVersionRepository postVersionRepository;

    @Mock
    private SavedPostRepository savedPostRepository;

    @Mock
    private DeleteProcessor deleteProcessor;

    @InjectMocks
    private PostScheduler postScheduler;

    @Test
    @DisplayName("cleanDeletedPosts - should execute cleanup job for deleted posts")
    void shouldExecuteCleanupJobForDeletedPosts() {
        // Act
        postScheduler.cleanDeletedPosts();

        // Verify
        verify(deleteProcessor).executeCleanupJob(
                eq(CronJobConstant.CLEAN_DELETED_FORUM_POSTS_JOB),
                any(),
                eq("Deleted %d posts"));
    }

    @Test
    @DisplayName("cleanDeletedPostVersions - should execute cleanup job with object keys for post versions")
    void shouldExecuteCleanupJobForDeletedPostVersions() {
        // Act
        postScheduler.cleanDeletedPostVersions();

        // Verify
        verify(deleteProcessor).executeCleanupJobHasObjectKeys(
                eq(CronJobConstant.CLEAN_DELETED_FORUM_POSTS_JOB),
                any(),
                eq("Deleted %d post versions with invalid post reference"));
    }

    @Test
    @DisplayName("cleanSavePosts - should execute cleanup job for invalid saved posts")
    void shouldExecuteCleanupJobForSavedPosts() {
        // Act
        postScheduler.cleanSavePosts();

        // Verify
        verify(deleteProcessor).executeCleanupJob(
                eq(CronJobConstant.CLEAN_DELETED_FORUM_POSTS_JOB),
                any(),
                eq("Deleted %d saved posts with invalid post reference"));
    }
}
