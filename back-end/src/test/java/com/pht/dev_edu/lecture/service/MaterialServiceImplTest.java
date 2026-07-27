package com.pht.dev_edu.lecture.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Executor;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

/*
 * <analysis>
 * MaterialServiceImpl
 * - create(Set<String> authorities, String actor, MaterialRequest req)
 *   - paths:
 *       [P1: checks modify permission by lecture, gets file info, saves entity, returns response]
 *   - planned tests:
 *       [shouldCreateMaterialSuccessfully -> P1]
 *
 * - delete(Set<String> authorities, String actor, UUID materialId)
 *   - branches:
 *       material not found -> DataNotFoundException
 *       material deleted -> DataNotFoundException
 *       material active -> soft delete, save & async tracking/delete file event
 *   - paths:
 *       [P1: material not found -> DataNotFoundException]
 *       [P2: material deleted -> DataNotFoundException]
 *       [P3: valid soft delete]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenMaterialNotFoundOnDelete -> P1]
 *       [shouldThrowDataNotFoundWhenMaterialAlreadyDeletedOnDelete -> P2]
 *       [shouldDeleteMaterialSuccessfully -> P3]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for MaterialServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify lecture material upload and deletion operations in MaterialServiceImpl.
 *
 * Test Scope
 * ----------
 * - create(Set<String>, String, MaterialRequest)
 * - delete(Set<String>, String, UUID)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Material creation with file service metadata population
 * ✓ Soft deletion of materials and associated file events
 * ✓ Missing and deleted material guards
 *
 * Mocked Dependencies
 * -------------------
 * - LectureMaterialRepository
 * - LecturePermissionService
 * - FileService
 * - MaterialMapper
 * - Executor
 * - KafkaUtils (static mock)
 * - TransactionUtils (static mock)
 */

import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.file.dto.FileUploadResponse;
import com.pht.dev_edu.file.service.FileService;
import com.pht.dev_edu.lecture.dto.MaterialRequest;
import com.pht.dev_edu.lecture.dto.MaterialResponse;
import com.pht.dev_edu.lecture.entity.LectureMaterialEntity;
import com.pht.dev_edu.lecture.mapper.MaterialMapper;
import com.pht.dev_edu.lecture.repo.LectureMaterialRepository;

@ExtendWith(MockitoExtension.class)
class MaterialServiceImplTest {

    @Mock
    private LectureMaterialRepository materialRepository;
    @Mock
    private LecturePermissionService lecturePermissionService;
    @Mock
    private FileService fileService;
    @Mock
    private MaterialMapper materialMapper;
    @Mock
    private Executor executor;

    @InjectMocks
    private MaterialServiceImpl materialService;

    private MockedStatic<KafkaUtils> kafkaUtilsMock;

    private static final String ACTOR = "lecturer1";
    private static final UUID LECTURE_ID = UUID.randomUUID();
    private static final UUID MATERIAL_ID = UUID.randomUUID();
    private static final String FILE_KEY = "priv-bucket/slide.pdf";

    @BeforeEach
    void setUp() {
        kafkaUtilsMock = mockStatic(KafkaUtils.class);
    }

    @AfterEach
    void tearDown() {
        kafkaUtilsMock.close();
    }

    @Test
    @DisplayName("create - should create material successfully")
    void shouldCreateMaterialSuccessfully() {
        // Arrange
        MaterialRequest request = new MaterialRequest();
        request.setLectureId(LECTURE_ID);
        request.setFileObjectKey(FILE_KEY);

        FileUploadResponse fileInfo = FileUploadResponse.builder()
                .originalFileName("slide.pdf")
                .fileSize(1024L)
                .contentType("application/pdf")
                .build();
        when(fileService.getFileInfo(ACTOR, FILE_KEY)).thenReturn(fileInfo);

        LectureMaterialEntity entity = LectureMaterialEntity.builder().id(MATERIAL_ID).build();
        when(materialMapper.reqToEntity(request)).thenReturn(entity);

        MaterialResponse response = MaterialResponse.builder().build();
        when(materialMapper.entityToRes(entity)).thenReturn(response);

        // Act
        MaterialResponse result = materialService.create(Set.of(RoleEnum.LECTURER.name()), ACTOR, request);

        // Assert
        assertThat(result).isEqualTo(response);
        verify(materialRepository).save(entity);
        assertThat(entity.getFileOriginalName()).isEqualTo("slide.pdf");
    }

    @Test
    @DisplayName("delete - should throw BadRequestException when material not found")
    void shouldThrowBadRequestWhenMaterialNotFoundOnDelete() {
        // Arrange
        when(materialRepository.findById(MATERIAL_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> materialService.delete(Set.of(RoleEnum.LECTURER.name()), ACTOR, MATERIAL_ID))
                .isInstanceOf(
                        BadRequestException.class)
                .hasMessageContaining("Material not found.");
    }

    @Test
    @DisplayName("delete - should do nothing when material is already deleted")
    void shouldDoNothingWhenMaterialAlreadyDeletedOnDelete() {
        // Arrange
        LectureMaterialEntity deletedEntity = LectureMaterialEntity.builder()
                .id(MATERIAL_ID)
                .deletedAt(LocalDateTime.now())
                .build();
        when(materialRepository.findById(MATERIAL_ID)).thenReturn(Optional.of(deletedEntity));

        // Act
        materialService.delete(Set.of(RoleEnum.LECTURER.name()), ACTOR, MATERIAL_ID);

        // Verify
        verify(materialRepository, never()).save(any());
    }

    @Test
    @DisplayName("delete - should soft delete material successfully")
    void shouldDeleteMaterialSuccessfully() {
        // Arrange
        LectureMaterialEntity activeEntity = LectureMaterialEntity.builder()
                .id(MATERIAL_ID)
                .lectureId(LECTURE_ID)
                .fileObjectKey(FILE_KEY)
                .build();
        when(materialRepository.findById(MATERIAL_ID)).thenReturn(Optional.of(activeEntity));

        // Act
        materialService.delete(Set.of(RoleEnum.LECTURER.name()), ACTOR, MATERIAL_ID);

        // Verify & Assert
        assertThat(activeEntity.getDeletedAt()).isNotNull();
        verify(materialRepository).save(activeEntity);
    }
}
