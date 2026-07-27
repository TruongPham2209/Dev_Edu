package com.pht.dev_edu.assignment.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;

/*
 * <analysis>
 * SubmissionServiceImpl
 * - getSubmissionsByAssignment(Set<String> authorities, String actor, UUID assignmentId, int page, int size)
 *   - paths:
 *       [P1: checks modify assignment permission, fetches paged submissions, returns CustomPaging]
 *   - planned tests:
 *       [shouldGetSubmissionsByAssignmentSuccessfully -> P1]
 *
 * - submit(String studentUsername, SubmissionRequest req)
 *   - branches:
 *       file contentType invalid (neither DOCUMENT nor ARCHIVE) -> KafkaUtils.sendDeleteFileEvent & BadRequestException
 *       file contentType valid -> save submission entity, publish Kafka event, return SubmissionResponse
 *   - paths:
 *       [P1: invalid file content type -> BadRequestException]
 *       [P2: valid submission]
 *   - planned tests:
 *       [shouldThrowBadRequestWhenFileContentTypeInvalid -> P1]
 *       [shouldSubmitAssignmentSuccessfully -> P2]
 *
 * - unSubmit(String studentUsername, UUID assignmentId)
 *   - branches:
 *       submission not found -> DataNotFoundException
 *       submission found -> deletes submission & publishes Kafka event
 *   - paths:
 *       [P1: submission not found -> DataNotFoundException]
 *       [P2: submission found -> deletes submission]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenUnSubmitSubmissionNotFound -> P1]
 *       [shouldUnSubmitSuccessfully -> P2]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for SubmissionServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify student submission and un-submission operations in SubmissionServiceImpl.
 *
 * Test Scope
 * ----------
 * - getSubmissionsByAssignment(Set<String>, String, UUID, int, int)
 * - submit(String, SubmissionRequest)
 * - unSubmit(String, UUID)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Fetching assignment submissions with pagination
 * ✓ File content type validation (DOCUMENT/ARCHIVE requirement)
 * ✓ Successful assignment submission and metadata population
 * ✓ Submission removal (un-submit)
 *
 * Mocked Dependencies
 * -------------------
 * - SubmissionRepository
 * - AssignmentPermissionService
 * - FileService
 * - AssignmentSubmissionMapper
 * - KafkaTemplate
 * - Executor
 * - KafkaUtils (static mock)
 * - TransactionUtils (static mock)
 */

import com.pht.dev_edu.assignment.dto.SubmissionProjection;
import com.pht.dev_edu.assignment.dto.SubmissionRequest;
import com.pht.dev_edu.assignment.dto.SubmissionResponse;
import com.pht.dev_edu.assignment.entity.SubmissionEntity;
import com.pht.dev_edu.assignment.mapper.AssignmentSubmissionMapper;
import com.pht.dev_edu.assignment.repo.SubmissionRepository;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.file.dto.FileUploadResponse;
import com.pht.dev_edu.file.service.FileService;

@ExtendWith(MockitoExtension.class)
class SubmissionServiceImplTest {

    @Mock
    private SubmissionRepository submissionRepository;
    @Mock
    private AssignmentPermissionService assignmentPermissionService;
    @Mock
    private FileService fileService;
    @Mock
    private AssignmentSubmissionMapper submissionMapper;
    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;
    @Mock
    private Executor executor;

    @InjectMocks
    private SubmissionServiceImpl submissionService;

    private MockedStatic<KafkaUtils> kafkaUtilsMock;

    private static final String STUDENT = "student1";
    private static final UUID ASSIGNMENT_ID = UUID.randomUUID();
    private static final String FILE_KEY = "priv-bucket/homework.pdf";

    @BeforeEach
    void setUp() {
        kafkaUtilsMock = mockStatic(KafkaUtils.class);
    }

    @AfterEach
    void tearDown() {
        kafkaUtilsMock.close();
    }

    // ==================== getSubmissionsByAssignment ====================

    @Test
    @DisplayName("getSubmissionsByAssignment - should return paged submissions")
    void shouldGetSubmissionsByAssignmentSuccessfully() {
        // Arrange
        SubmissionProjection projection = mock(SubmissionProjection.class);
        PageImpl<SubmissionProjection> page = new PageImpl<>(List.of(projection));

        when(submissionRepository.findByAssignmentId(eq(ASSIGNMENT_ID), any(Pageable.class)))
                .thenReturn(page);

        SubmissionResponse response = SubmissionResponse.builder().build();
        when(submissionMapper.projectionToRes(projection)).thenReturn(response);

        // Act
        CustomPaging<SubmissionResponse> result = submissionService.getSubmissionsByAssignment(Set.of("ROLE_LECTURER"),
                "lecturer1", ASSIGNMENT_ID, 0, 10);

        // Assert
        assertThat(result).isNotNull();
    }

    // ==================== submit ====================

    @Test
    @DisplayName("submit - should throw BadRequestException when file content type is invalid")
    void shouldThrowBadRequestWhenFileContentTypeInvalid() {
        // Arrange
        SubmissionRequest request = new SubmissionRequest();
        request.setAssignmentId(ASSIGNMENT_ID);
        request.setFileObjectKey(FILE_KEY);

        FileUploadResponse fileInfo = FileUploadResponse.builder()
                .contentType("image/jpeg") // Non-document, non-archive file
                .build();
        when(fileService.getFileInfo(STUDENT, FILE_KEY)).thenReturn(fileInfo);

        // Act & Assert
        assertThatThrownBy(() -> submissionService.submit(STUDENT, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid file type.");

        kafkaUtilsMock.verify(() -> KafkaUtils.sendDeleteFileEvent(FILE_KEY));
    }

    @Test
    @DisplayName("submit - should submit assignment successfully")
    void shouldSubmitAssignmentSuccessfully() {
        // Arrange
        SubmissionRequest request = new SubmissionRequest();
        request.setAssignmentId(ASSIGNMENT_ID);
        request.setFileObjectKey(FILE_KEY);

        FileUploadResponse fileInfo = FileUploadResponse.builder()
                .originalFileName("homework.pdf")
                .fileSize(2048L)
                .contentType("application/pdf")
                .build();
        when(fileService.getFileInfo(STUDENT, FILE_KEY)).thenReturn(fileInfo);

        SubmissionEntity entity = SubmissionEntity.builder().build();
        when(submissionMapper.reqToEntity(request)).thenReturn(entity);

        SubmissionResponse response = SubmissionResponse.builder().build();
        when(submissionMapper.entityToResponse(entity)).thenReturn(response);

        // Act
        SubmissionResponse result = submissionService.submit(STUDENT, request);

        // Assert
        assertThat(result).isEqualTo(response);
        verify(submissionRepository).save(entity);
        assertThat(entity.getStudentUsername()).isEqualTo(STUDENT);
        assertThat(result.getFileName()).isEqualTo("homework.pdf");
    }

    // ==================== unSubmit ====================

    @Test
    @DisplayName("unSubmit - should throw DataNotFoundException when submission not found")
    void shouldThrowDataNotFoundWhenUnSubmitSubmissionNotFound() {
        // Arrange
        when(submissionRepository.findByAssignmentIdAndStudentUsername(ASSIGNMENT_ID, STUDENT))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> submissionService.unSubmit(STUDENT, ASSIGNMENT_ID))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Submission not found.");
    }

    @Test
    @DisplayName("unSubmit - should delete submission successfully")
    void shouldUnSubmitSuccessfully() {
        // Arrange
        SubmissionEntity entity = SubmissionEntity.builder()
                .assignmentId(ASSIGNMENT_ID)
                .studentUsername(STUDENT)
                .fileObjectKey(FILE_KEY)
                .build();
        when(submissionRepository.findByAssignmentIdAndStudentUsername(ASSIGNMENT_ID, STUDENT))
                .thenReturn(Optional.of(entity));

        // Act
        submissionService.unSubmit(STUDENT, ASSIGNMENT_ID);

        // Verify
        verify(submissionRepository).delete(entity);
    }
}
