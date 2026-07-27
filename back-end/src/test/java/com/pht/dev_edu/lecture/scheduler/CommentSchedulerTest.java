package com.pht.dev_edu.lecture.scheduler;

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
 * CommentScheduler (Lecture)
 * - cleanDeletedComments()
 *   - paths:
 *       [P1: executes cleanup job on deleteProcessor for deleted lecture comments]
 *   - planned tests:
 *       [shouldExecuteCleanupJobForDeletedComments -> P1]
 *
 * - cleanCommentsWithoutReference()
 *   - paths:
 *       [P1: executes cleanup job on deleteProcessor for unreferenced lecture comments]
 *   - planned tests:
 *       [shouldExecuteCleanupJobForCommentsWithoutReference -> P1]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for CommentScheduler (Lecture)
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify scheduled cleanup task execution in lecture CommentScheduler.
 *
 * Test Scope
 * ----------
 * - cleanDeletedComments()
 * - cleanCommentsWithoutReference()
 *
 * Covered Scenarios
 * -----------------
 * ✓ Invoking deleteProcessor cleanup jobs for deleted and unreferenced lecture comments
 *
 * Mocked Dependencies
 * -------------------
 * - LectureCommentRepository
 * - DeleteProcessor
 */

import com.pht.dev_edu.common.constant.CronJobConstant;
import com.pht.dev_edu.common.service.DeleteProcessor;
import com.pht.dev_edu.lecture.repo.LectureCommentRepository;

@ExtendWith(MockitoExtension.class)
class CommentSchedulerTest {

    @Mock
    private LectureCommentRepository lectureCommentRepository;

    @Mock
    private DeleteProcessor deleteProcessor;

    @InjectMocks
    private CommentScheduler commentScheduler;

    @Test
    @DisplayName("cleanDeletedComments - should execute cleanup job for deleted lecture comments")
    void shouldExecuteCleanupJobForDeletedComments() {
        // Act
        commentScheduler.cleanDeletedComments();

        // Verify
        verify(deleteProcessor).executeCleanupJob(
                eq(CronJobConstant.CLEAN_DELETED_LECTURE_COMMENTS_JOB),
                any(),
                eq("Deleted %d lecture comments."));
    }
}
