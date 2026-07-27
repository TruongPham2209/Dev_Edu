package com.pht.dev_edu.course.scheduler;

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
 * CategoryScheduler
 * - cleanDeletedAssignments()
 *   - paths:
 *       [P1: calls deleteProcessor.executeCleanupJobHasObjectKeys with cutoff time supplier]
 *   - planned tests:
 *       [shouldExecuteCleanupJobForDeletedCategories -> P1]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for CategoryScheduler
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify cleanup task execution in CategoryScheduler.
 *
 * Test Scope
 * ----------
 * - cleanDeletedAssignments()
 *
 * Covered Scenarios
 * -----------------
 * ✓ Invoking deleteProcessor cleanup job
 *
 * Mocked Dependencies
 * -------------------
 * - CategoryRepository
 * - DeleteProcessor
 */

import com.pht.dev_edu.common.constant.CronJobConstant;
import com.pht.dev_edu.common.service.DeleteProcessor;
import com.pht.dev_edu.course.repo.CategoryRepository;

@ExtendWith(MockitoExtension.class)
class CategorySchedulerTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private DeleteProcessor deleteProcessor;

    @InjectMocks
    private CategoryScheduler categoryScheduler;

    @Test
    @DisplayName("cleanDeletedAssignments - should invoke cleanup job on deleteProcessor")
    void shouldExecuteCleanupJobForDeletedCategories() {
        // Act
        categoryScheduler.cleanDeletedAssignments();

        // Verify
        verify(deleteProcessor).executeCleanupJobHasObjectKeys(
                eq(CronJobConstant.CLEAN_DELETED_CATEGORIES_JOB),
                any(),
                eq("Deleted %d categories."));
    }
}
