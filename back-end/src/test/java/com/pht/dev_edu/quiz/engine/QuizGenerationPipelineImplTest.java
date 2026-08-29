package com.pht.dev_edu.quiz.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Executor;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.file.dto.FileUploadResponse;
import com.pht.dev_edu.file.repo.FileUploadRepository;
import com.pht.dev_edu.file.service.FileService;
import com.pht.dev_edu.quiz.dto.enums.DocumentSourceType;
import com.pht.dev_edu.quiz.dto.enums.DocumentStatus;
import com.pht.dev_edu.quiz.dto.enums.DocumentVisibility;
import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import com.pht.dev_edu.quiz.dto.enums.QuizGenerationJobStatus;
import com.pht.dev_edu.quiz.dto.enums.QuizStatus;
import com.pht.dev_edu.quiz.dto.request.GenerateQuizFromDocumentRequest;
import com.pht.dev_edu.quiz.dto.response.QuestionSourceTraceResponse;
import com.pht.dev_edu.quiz.dto.response.QuizGenerationJobResponse;
import com.pht.dev_edu.quiz.entity.CourseDocumentEntity;
import com.pht.dev_edu.quiz.entity.DocumentKnowledgeChunkEntity;
import com.pht.dev_edu.quiz.entity.QuizEntity;
import com.pht.dev_edu.quiz.entity.QuizGenerationJobEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionSourceTraceEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionTypeConfigEntity;
import com.pht.dev_edu.quiz.repo.CourseDocumentRepository;
import com.pht.dev_edu.quiz.repo.DocumentKnowledgeChunkRepository;
import com.pht.dev_edu.quiz.repo.QuizGenerationJobRepository;
import com.pht.dev_edu.quiz.repo.QuizQuestionOptionRepo;
import com.pht.dev_edu.quiz.repo.QuizQuestionRepo;
import com.pht.dev_edu.quiz.repo.QuizQuestionSourceTraceRepository;
import com.pht.dev_edu.quiz.repo.QuizQuestionTypeConfigRepo;
import com.pht.dev_edu.quiz.repo.QuizRepo;
import com.pht.dev_edu.quiz.service.QuizAccessService;

/*
 * <analysis>
 * QuizGenerationPipelineImpl
 * - startGenerationJob(GenerateQuizFromDocumentRequest request, InputStream fileStream, String username)
 *   - branches:
 *       quiz not found -> DataNotFoundException
 *       typeConfigs missing or empty -> BadRequestException
 *       remaining question slots <= 0 -> BadRequestException (Early Capacity Guard)
 *       documentId provided without sourceType -> auto-normalizes sourceType to LIBRARY and loads metadata
 *       valid configuration -> persists job in PENDING status and triggers executePipelineAsync
 *   - paths:
 *       [P1: quiz not found -> DataNotFoundException]
 *       [P2: typeConfigs missing -> BadRequestException]
 *       [P3: remaining slots <= 0 -> BadRequestException]
 *       [P4: valid request with documentId -> normalizes to LIBRARY and launches async pipeline]
 *       [P5: valid request with direct upload stream -> launches async pipeline]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenQuizNotFound -> P1]
 *       [shouldThrowBadRequestWhenNoTypeConfigsDefined -> P2]
 *       [shouldThrowBadRequestWhenNoRemainingQuestionSlotsAvailable -> P3]
 *       [shouldStartGenerationJobFromLibraryDocumentSuccessfully -> P4]
 *       [shouldStartGenerationJobWithUploadStreamSuccessfully -> P5]
 *
 * - startGenerationJobFromFile(UUID quizId, String description, Boolean saveDocument, MultipartFile file, String username)
 *   - branches:
 *       file is null or empty -> BadRequestException
 *       valid file -> uploads to private bucket and delegates to startGenerationJob
 *   - paths:
 *       [P1: empty file -> BadRequestException]
 *       [P2: valid file -> uploads to private bucket and creates job]
 *   - planned tests:
 *       [shouldThrowBadRequestWhenUploadedFileIsEmpty -> P1]
 *       [shouldUploadFileToPrivateBucketAndStartGenerationJob -> P2]
 *
 * - getJobStatus(UUID jobId, String username)
 *   - branches:
 *       job not found -> DataNotFoundException
 *       job found -> returns QuizGenerationJobResponse
 *   - paths:
 *       [P1: job not found -> DataNotFoundException]
 *       [P2: job found -> returns mapped response]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenJobNotFound -> P1]
 *       [shouldReturnJobStatusWhenJobExists -> P2]
 *
 * - getQuestionSourceTraceability(UUID jobId, UUID questionId)
 *   - branches:
 *       trace record not found -> DataNotFoundException
 *       trace record found -> returns QuestionSourceTraceResponse
 *   - paths:
 *       [P1: trace not found -> DataNotFoundException]
 *       [P2: trace found -> returns mapped response]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenTraceRecordNotFound -> P1]
 *       [shouldReturnQuestionSourceTraceabilityWhenExists -> P2]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for QuizGenerationPipelineImpl (AI Quiz Generation Feature)
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify core orchestration, early capacity validation guards, file upload handling,
 * document source normalization, and traceability retrieval in QuizGenerationPipelineImpl.
 *
 * Test Scope
 * ----------
 * - startGenerationJob(GenerateQuizFromDocumentRequest, InputStream, String)
 * - startGenerationJobFromFile(UUID, String, Boolean, MultipartFile, String)
 * - getJobStatus(UUID, String)
 * - getQuestionSourceTraceability(UUID, UUID)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Missing quiz entity handling (DataNotFoundException)
 * ✓ Missing question type configurations handling (BadRequestException)
 * ✓ Early capacity guard when all question slots are filled (BadRequestException)
 * ✓ Normalization of DocumentSourceType.LIBRARY when selecting existing document
 * ✓ Uploading file directly to private bucket and launching async pipeline
 * ✓ Empty file rejection on upload
 * ✓ Job status query and traceability lookup
 *
 * Mocked Dependencies
 * -------------------
 * - DocumentProcessingService, CourseRelevanceEvaluator, KnowledgeAvailabilityEvaluator
 * - QuizRequirementValidator, QuizPlannerService, KnowledgeRetrieverService
 * - QuestionGeneratorService, QuestionValidationPipeline, DocumentPromotionService
 * - QuizAccessService, FileService, Repositories
 */
@ExtendWith(MockitoExtension.class)
class QuizGenerationPipelineImplTest {

    @Mock
    private DocumentProcessingService documentProcessingService;
    @Mock
    private CourseRelevanceEvaluator courseRelevanceEvaluator;
    @Mock
    private KnowledgeAvailabilityEvaluator knowledgeAvailabilityEvaluator;
    @Mock
    private QuizRequirementValidator quizRequirementValidator;
    @Mock
    private QuizPlannerService quizPlannerService;
    @Mock
    private KnowledgeRetrieverService knowledgeRetrieverService;
    @Mock
    private QuestionGeneratorService questionGeneratorService;
    @Mock
    private QuestionValidationPipeline questionValidationPipeline;
    @Mock
    private DocumentPromotionService documentPromotionService;
    @Mock
    private QuizAccessService quizAccessService;
    @Mock
    private FileService fileService;

    @Mock
    private QuizGenerationJobRepository jobRepository;
    @Mock
    private QuizRepo quizRepo;
    @Mock
    private QuizQuestionRepo quizQuestionRepo;
    @Mock
    private QuizQuestionOptionRepo quizQuestionOptionRepo;
    @Mock
    private QuizQuestionTypeConfigRepo quizQuestionTypeConfigRepo;
    @Mock
    private QuizQuestionSourceTraceRepository sourceTraceRepository;
    @Mock
    private DocumentKnowledgeChunkRepository chunkRepository;
    @Mock
    private CourseDocumentRepository courseDocumentRepository;
    @Mock
    private FileUploadRepository fileUploadRepository;
    @Mock
    private Executor taskExecutor;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private QuizGenerationPipelineImpl pipeline;

    private static final String USERNAME = "lecturer_dev";
    private static final UUID QUIZ_ID = UUID.randomUUID();
    private static final UUID COURSE_ID = UUID.randomUUID();
    private static final UUID DOCUMENT_ID = UUID.randomUUID();
    private static final UUID JOB_ID = UUID.randomUUID();
    private static final UUID QUESTION_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        pipeline = new QuizGenerationPipelineImpl(
                documentProcessingService,
                courseRelevanceEvaluator,
                knowledgeAvailabilityEvaluator,
                quizRequirementValidator,
                quizPlannerService,
                knowledgeRetrieverService,
                questionGeneratorService,
                questionValidationPipeline,
                documentPromotionService,
                quizAccessService,
                fileService,
                jobRepository,
                quizRepo,
                quizQuestionRepo,
                quizQuestionOptionRepo,
                quizQuestionTypeConfigRepo,
                sourceTraceRepository,
                chunkRepository,
                courseDocumentRepository,
                fileUploadRepository,
                taskExecutor,
                objectMapper
        );

        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(new UsernamePasswordAuthenticationToken(
                USERNAME,
                "password",
                List.of(new SimpleGrantedAuthority("LECTURER"))
        ));
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @DisplayName("startGenerationJob - should throw DataNotFoundException when quiz not found")
    void shouldThrowDataNotFoundWhenQuizNotFound() {
        // Arrange
        GenerateQuizFromDocumentRequest request = GenerateQuizFromDocumentRequest.builder()
                .quizId(QUIZ_ID)
                .build();
        when(quizRepo.findById(QUIZ_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> pipeline.startGenerationJob(request, null, USERNAME))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Quiz not found");
    }

    @Test
    @DisplayName("startGenerationJob - should throw BadRequestException when quiz has no question type configurations")
    void shouldThrowBadRequestWhenNoTypeConfigsDefined() {
        // Arrange
        QuizEntity quiz = QuizEntity.builder()
                .id(QUIZ_ID)
                .courseId(COURSE_ID)
                .status(QuizStatus.DRAFT)
                .build();
        when(quizRepo.findById(QUIZ_ID)).thenReturn(Optional.of(quiz));
        when(quizQuestionTypeConfigRepo.findByQuizId(QUIZ_ID)).thenReturn(Collections.emptyList());

        GenerateQuizFromDocumentRequest request = GenerateQuizFromDocumentRequest.builder()
                .quizId(QUIZ_ID)
                .build();

        // Act & Assert
        assertThatThrownBy(() -> pipeline.startGenerationJob(request, null, USERNAME))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("has no question type configurations defined");
    }

    @Test
    @DisplayName("startGenerationJob - should throw BadRequestException when remaining question slots <= 0")
    void shouldThrowBadRequestWhenNoRemainingQuestionSlotsAvailable() {
        // Arrange
        QuizEntity quiz = QuizEntity.builder()
                .id(QUIZ_ID)
                .courseId(COURSE_ID)
                .status(QuizStatus.DRAFT)
                .build();
        when(quizRepo.findById(QUIZ_ID)).thenReturn(Optional.of(quiz));

        QuizQuestionTypeConfigEntity config = QuizQuestionTypeConfigEntity.builder()
                .quizId(QUIZ_ID)
                .questionType(QuestionType.SINGLE_CHOICE)
                .requiredCount(5)
                .build();
        when(quizQuestionTypeConfigRepo.findByQuizId(QUIZ_ID)).thenReturn(List.of(config));
        // All 5 questions already exist
        when(quizQuestionRepo.countByQuizIdAndQuestionTypeAndDeletedAtIsNull(QUIZ_ID, QuestionType.SINGLE_CHOICE)).thenReturn(5);

        GenerateQuizFromDocumentRequest request = GenerateQuizFromDocumentRequest.builder()
                .quizId(QUIZ_ID)
                .build();

        // Act & Assert
        assertThatThrownBy(() -> pipeline.startGenerationJob(request, null, USERNAME))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("has no remaining question slots available for generation");
    }

    @Test
    @DisplayName("startGenerationJob - should normalize sourceType to LIBRARY and start generation job successfully")
    void shouldStartGenerationJobFromLibraryDocumentSuccessfully() {
        // Arrange
        QuizEntity quiz = QuizEntity.builder()
                .id(QUIZ_ID)
                .courseId(COURSE_ID)
                .status(QuizStatus.DRAFT)
                .build();
        when(quizRepo.findById(QUIZ_ID)).thenReturn(Optional.of(quiz));

        QuizQuestionTypeConfigEntity config = QuizQuestionTypeConfigEntity.builder()
                .quizId(QUIZ_ID)
                .questionType(QuestionType.SINGLE_CHOICE)
                .requiredCount(5)
                .build();
        when(quizQuestionTypeConfigRepo.findByQuizId(QUIZ_ID)).thenReturn(List.of(config));
        when(quizQuestionRepo.countByQuizIdAndQuestionTypeAndDeletedAtIsNull(QUIZ_ID, QuestionType.SINGLE_CHOICE)).thenReturn(2);

        CourseDocumentEntity globalDoc = CourseDocumentEntity.builder()
                .id(DOCUMENT_ID)
                .fileName("Java_Core.pdf")
                .fileObjectKey("private-bucket/dev_edu/Java_Core.pdf")
                .status(DocumentStatus.READY)
                .visibility(DocumentVisibility.GLOBAL)
                .build();
        when(courseDocumentRepository.findByIdAndDeletedAtIsNull(DOCUMENT_ID)).thenReturn(Optional.of(globalDoc));

        QuizRequirementValidator.ValidatedRequirements reqs = QuizRequirementValidator.ValidatedRequirements.builder()
                .totalQuestions(3)
                .typeDistribution(Map.of(QuestionType.SINGLE_CHOICE, 3))
                .build();
        when(quizRequirementValidator.validateAndNormalize(any())).thenReturn(reqs);

        QuizGenerationJobEntity savedJob = QuizGenerationJobEntity.builder()
                .id(JOB_ID)
                .courseId(COURSE_ID)
                .documentId(DOCUMENT_ID)
                .documentName("Java_Core.pdf")
                .status(QuizGenerationJobStatus.PENDING)
                .currentStep("PENDING")
                .requestedTotal(3)
                .createdBy(USERNAME)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        when(jobRepository.saveAndFlush(any())).thenReturn(savedJob);

        GenerateQuizFromDocumentRequest request = GenerateQuizFromDocumentRequest.builder()
                .quizId(QUIZ_ID)
                .documentId(DOCUMENT_ID)
                .description("Focus on threading")
                .build();

        // Act
        QuizGenerationJobResponse response = pipeline.startGenerationJob(request, null, USERNAME);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getJobId()).isEqualTo(JOB_ID);
        assertThat(response.getStatus()).isEqualTo(QuizGenerationJobStatus.PENDING);
        assertThat(request.getSourceType()).isEqualTo(DocumentSourceType.LIBRARY);
        verify(quizAccessService).validateAccessByQuiz(eq(USERNAME), any(), eq(QUIZ_ID));
        verify(jobRepository).saveAndFlush(any());
        verify(taskExecutor).execute(any());
    }

    @Test
    @DisplayName("startGenerationJobFromFile - should throw BadRequestException when uploaded file is empty")
    void shouldThrowBadRequestWhenUploadedFileIsEmpty() {
        // Arrange
        MockMultipartFile emptyFile = new MockMultipartFile("file", "empty.pdf", "application/pdf", new byte[0]);

        // Act & Assert
        assertThatThrownBy(() -> pipeline.startGenerationJobFromFile(QUIZ_ID, "Desc", false, emptyFile, USERNAME))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Uploaded file is empty");
        verify(fileService, never()).uploadDirectFile(any(), any(Boolean.class), any());
    }

    @Test
    @DisplayName("startGenerationJobFromFile - should upload file to private bucket and launch generation job")
    void shouldUploadFileToPrivateBucketAndStartGenerationJob() {
        // Arrange
        byte[] content = "%PDF-1.4 Mock PDF Content".getBytes();
        MockMultipartFile validFile = new MockMultipartFile("file", "test.pdf", "application/pdf", content);

        FileUploadResponse fileResp = FileUploadResponse.builder()
                .originalFileName("test.pdf")
                .objectKey("private-bucket/dev_edu/177000-test.pdf")
                .fileSize((long) content.length)
                .build();
        when(fileService.uploadDirectFile(validFile, false, USERNAME)).thenReturn(fileResp);

        QuizEntity quiz = QuizEntity.builder()
                .id(QUIZ_ID)
                .courseId(COURSE_ID)
                .status(QuizStatus.DRAFT)
                .build();
        when(quizRepo.findById(QUIZ_ID)).thenReturn(Optional.of(quiz));

        QuizQuestionTypeConfigEntity config = QuizQuestionTypeConfigEntity.builder()
                .quizId(QUIZ_ID)
                .questionType(QuestionType.SINGLE_CHOICE)
                .requiredCount(5)
                .build();
        when(quizQuestionTypeConfigRepo.findByQuizId(QUIZ_ID)).thenReturn(List.of(config));
        when(quizQuestionRepo.countByQuizIdAndQuestionTypeAndDeletedAtIsNull(QUIZ_ID, QuestionType.SINGLE_CHOICE)).thenReturn(0);

        QuizRequirementValidator.ValidatedRequirements reqs = QuizRequirementValidator.ValidatedRequirements.builder()
                .totalQuestions(5)
                .typeDistribution(Map.of(QuestionType.SINGLE_CHOICE, 5))
                .build();
        when(quizRequirementValidator.validateAndNormalize(any())).thenReturn(reqs);

        QuizGenerationJobEntity savedJob = QuizGenerationJobEntity.builder()
                .id(JOB_ID)
                .courseId(COURSE_ID)
                .documentName("test.pdf")
                .status(QuizGenerationJobStatus.PENDING)
                .currentStep("PENDING")
                .requestedTotal(5)
                .createdBy(USERNAME)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        when(jobRepository.saveAndFlush(any())).thenReturn(savedJob);

        // Act
        QuizGenerationJobResponse response = pipeline.startGenerationJobFromFile(QUIZ_ID, "Desc", true, validFile, USERNAME);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getJobId()).isEqualTo(JOB_ID);
        verify(fileService).uploadDirectFile(validFile, false, USERNAME);
        verify(jobRepository).saveAndFlush(any());
        verify(taskExecutor).execute(any());
    }

    @Test
    @DisplayName("getJobStatus - should throw DataNotFoundException when job not found")
    void shouldThrowDataNotFoundWhenJobNotFound() {
        // Arrange
        when(jobRepository.findById(JOB_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> pipeline.getJobStatus(JOB_ID, USERNAME))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Quiz generation job not found");
    }

    @Test
    @DisplayName("getJobStatus - should return mapped response when job exists")
    void shouldReturnJobStatusWhenJobExists() {
        // Arrange
        QuizGenerationJobEntity job = QuizGenerationJobEntity.builder()
                .id(JOB_ID)
                .courseId(COURSE_ID)
                .documentId(DOCUMENT_ID)
                .documentName("Java_Core.pdf")
                .status(QuizGenerationJobStatus.COMPLETED)
                .currentStep("FINISHED")
                .requestedTotal(5)
                .acceptedCount(5)
                .rejectedCount(0)
                .resultQuizId(QUIZ_ID)
                .createdBy(USERNAME)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        when(jobRepository.findById(JOB_ID)).thenReturn(Optional.of(job));

        // Act
        QuizGenerationJobResponse response = pipeline.getJobStatus(JOB_ID, USERNAME);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getJobId()).isEqualTo(JOB_ID);
        assertThat(response.getStatus()).isEqualTo(QuizGenerationJobStatus.COMPLETED);
        assertThat(response.getAcceptedCount()).isEqualTo(5);
        assertThat(response.getResultQuizId()).isEqualTo(QUIZ_ID);
    }

    @Test
    @DisplayName("getQuestionSourceTraceability - should throw DataNotFoundException when trace record not found")
    void shouldThrowDataNotFoundWhenTraceRecordNotFound() {
        // Arrange
        when(sourceTraceRepository.findByQuestionId(QUESTION_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> pipeline.getQuestionSourceTraceability(JOB_ID, QUESTION_ID))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Source traceability record not found for question");
    }

    @Test
    @DisplayName("getQuestionSourceTraceability - should return mapped trace response when record exists")
    void shouldReturnQuestionSourceTraceabilityWhenExists() {
        // Arrange
        QuizQuestionSourceTraceEntity trace = QuizQuestionSourceTraceEntity.builder()
                .id(UUID.randomUUID())
                .questionId(QUESTION_ID)
                .generationJobId(JOB_ID)
                .documentId(DOCUMENT_ID)
                .chunkId(UUID.randomUUID())
                .sectionName("Chương 3: Multithreading")
                .pageNumber(42)
                .modelName("gpt-4o-mini")
                .promptVersion("v1.0")
                .attemptCount(1)
                .validationMetrics("{\"passed\":true}")
                .createdAt(LocalDateTime.now())
                .build();
        when(sourceTraceRepository.findByQuestionId(QUESTION_ID)).thenReturn(Optional.of(trace));

        // Act
        QuestionSourceTraceResponse response = pipeline.getQuestionSourceTraceability(JOB_ID, QUESTION_ID);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getQuestionId()).isEqualTo(QUESTION_ID);
        assertThat(response.getGenerationJobId()).isEqualTo(JOB_ID);
        assertThat(response.getSectionName()).isEqualTo("Chương 3: Multithreading");
        assertThat(response.getPageNumber()).isEqualTo(42);
        assertThat(response.getModelName()).isEqualTo("gpt-4o-mini");
    }
}
