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
 * CommentScheduler
 * - cleanDeletedComments()
 *   - paths:
 *       [P1: executes cleanup job on deleteProcessor for deleted comments]
 *   - planned tests:
 *       [shouldExecuteCleanupJobForDeletedComments -> P1]
 *
 * - cleanCommentsWithoutReference()
 *   - paths:
 *       [P1: executes cleanup job on deleteProcessor for comments without reference]
 *   - planned tests:
 *       [shouldExecuteCleanupJobForCommentsWithoutReference -> P1]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for CommentScheduler
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify cleanup task execution in CommentScheduler.
 *
 * Test Scope
 * ----------
 * - cleanDeletedComments()
 * - cleanCommentsWithoutReference()
 *
 * Covered Scenarios
 * -----------------
 * ✓ Invoking deleteProcessor cleanup jobs for deleted comments and unreferenced comments
 *
 * Mocked Dependencies
 * -------------------
 * - CommentRepository
 * - DeleteProcessor
 */

import com.pht.dev_edu.common.constant.CronJobConstant;
import com.pht.dev_edu.common.service.DeleteProcessor;
import com.pht.dev_edu.forum.repo.CommentRepository;

@ExtendWith(MockitoExtension.class)
class CommentSchedulerTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private DeleteProcessor deleteProcessor;

    @InjectMocks
    private CommentScheduler commentScheduler;

    @Test
    @DisplayName("cleanDeletedComments - should execute cleanup job for deleted comments")
    void shouldExecuteCleanupJobForDeletedComments() {
        // Act
        commentScheduler.cleanDeletedComments();

        // Verify
        verify(deleteProcessor).executeCleanupJob(
                eq(CronJobConstant.CLEAN_DELETED_FORUM_COMMENTS_JOB),
                any(),
                eq("Deleted %d comments that were marked for deletion"));
    }

    @Test
    @DisplayName("cleanCommentsWithoutReference - should execute cleanup job for comments without post reference")
    void shouldExecuteCleanupJobForCommentsWithoutReference() {
        // Act
        commentScheduler.cleanCommentsWithoutReference();

        // Verify
        verify(deleteProcessor).executeCleanupJob(
                eq(CronJobConstant.CLEAN_DELETED_FORUM_COMMENTS_JOB),
                any(),
                eq("Deleted %d comments that were marked for deletion and have no reference to any post"));
    }
}
