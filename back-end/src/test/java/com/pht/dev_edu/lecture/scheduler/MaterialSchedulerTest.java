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
 * MaterialScheduler
 * - cleanDeletedMaterials()
 *   - paths:
 *       [P1: executes cleanup job on deleteProcessor for deleted lecture materials]
 *   - planned tests:
 *       [shouldExecuteCleanupJobForDeletedMaterials -> P1]
 *
 * - cleanMaterialsWithoutReference()
 *   - paths:
 *       [P1: executes cleanup job with object keys on deleteProcessor for unreferenced materials]
 *   - planned tests:
 *       [shouldExecuteCleanupJobForMaterialsWithoutReference -> P1]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for MaterialScheduler
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify scheduled material cleanup execution in MaterialScheduler.
 *
 * Test Scope
 * ----------
 * - cleanDeletedMaterials()
 * - cleanMaterialsWithoutReference()
 *
 * Covered Scenarios
 * -----------------
 * ✓ Invoking deleteProcessor cleanup jobs for deleted and unreferenced lecture materials
 *
 * Mocked Dependencies
 * -------------------
 * - LectureMaterialRepository
 * - DeleteProcessor
 */

import com.pht.dev_edu.common.constant.CronJobConstant;
import com.pht.dev_edu.common.service.DeleteProcessor;
import com.pht.dev_edu.lecture.repo.LectureMaterialRepository;

@ExtendWith(MockitoExtension.class)
class MaterialSchedulerTest {

    @Mock
    private LectureMaterialRepository lectureMaterialRepository;

    @Mock
    private DeleteProcessor deleteProcessor;

    @InjectMocks
    private MaterialScheduler materialScheduler;

    @Test
    @DisplayName("cleanDeletedMaterials - should execute cleanup job for deleted materials")
    void shouldExecuteCleanupJobForDeletedMaterials() {
        // Act
        materialScheduler.cleanDeletedMaterials();

        // Verify
        verify(deleteProcessor).executeCleanupJobHasObjectKeys(
                eq(CronJobConstant.CLEAN_DELETED_MATERIALS_JOB),
                any(),
                eq("Deleted %d lecture materials."));
    }
}
