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
 * CourseScheduler
 * - cleanDeletedCourses()
 *   - paths:
 *       [P1: calls deleteProcessor.executeCleanupJobHasObjectKeys with cutoff time supplier]
 *   - planned tests:
 *       [shouldExecuteCleanupJobForDeletedCourses -> P1]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for CourseScheduler
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify cleanup task execution in CourseScheduler.
 *
 * Test Scope
 * ----------
 * - cleanDeletedCourses()
 *
 * Covered Scenarios
 * -----------------
 * ✓ Invoking deleteProcessor cleanup job
 *
 * Mocked Dependencies
 * -------------------
 * - CourseRepository
 * - DeleteProcessor
 */

import com.pht.dev_edu.common.constant.CronJobConstant;
import com.pht.dev_edu.common.service.DeleteProcessor;
import com.pht.dev_edu.course.repo.CourseRepository;

@ExtendWith(MockitoExtension.class)
class CourseSchedulerTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private DeleteProcessor deleteProcessor;

    @InjectMocks
    private CourseScheduler courseScheduler;

    @Test
    @DisplayName("cleanDeletedCourses - should invoke cleanup job on deleteProcessor")
    void shouldExecuteCleanupJobForDeletedCourses() {
        // Act
        courseScheduler.cleanDeletedCourses();

        // Verify
        verify(deleteProcessor).executeCleanupJobHasObjectKeys(
                eq(CronJobConstant.CLEAN_DELETED_COURSES_JOB),
                any(),
                eq("Deleted %d courses"));
    }
}
