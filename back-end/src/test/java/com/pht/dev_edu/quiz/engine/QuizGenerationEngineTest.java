package com.pht.dev_edu.quiz.engine;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.quiz.dto.engine.GeneratedQuestionContract;
import com.pht.dev_edu.quiz.dto.enums.QuestionDifficulty;
import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import com.pht.dev_edu.quiz.dto.enums.ValidationFailureReason;
import com.pht.dev_edu.quiz.dto.request.GenerateQuizFromDocumentRequest;
import com.pht.dev_edu.quiz.entity.DocumentKnowledgeChunkEntity;
import com.pht.dev_edu.quiz.repo.QuizQuestionRepo;

/*
 * <analysis>
 * QuizGenerationEngine Components
 * - QuizRequirementValidator.validateAndNormalize()
 *   - paths:
 *       [P1: total questions mismatch with distribution sum -> throw BadRequestException]
 *       [P2: default normalization when distributions are empty -> fill valid type & difficulty distributions]
 *   - planned tests:
 *       [testRequirementValidationMismatchedDistribution -> P1]
 *       [testRequirementValidationDefaultNormalization -> P2]
 *
 * - KnowledgeAvailabilityEvaluator.evaluateCapacity()
 *   - paths: [P1: requested questions exceed chunk capacity -> status INSUFFICIENT_KNOWLEDGE]
 *   - planned tests: [testKnowledgeAvailabilityCapacity -> P1]
 *
 * - QuestionValidationPipeline.validateQuestion()
 *   - paths:
 *       [P1: ambiguous correct options for SINGLE_CHOICE -> fail with AMBIGUOUS_ANSWER]
 *       [P2: semantic duplicate detection against existing batch -> fail with DUPLICATE]
 *       [P3: valid grounded question -> pass validation]
 *   - planned tests:
 *       [testQuestionValidationAmbiguousAnswer -> P1]
 *       [testQuestionValidationDuplicateDetection -> P2]
 *       [testQuestionValidationSuccess -> P3]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for QuizGenerationEngine Core Components
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify requirement normalization, knowledge capacity evaluation, and question
 * validation rules (duplicate detection, ambiguous options, grounding) in the AI Quiz generation engine.
 *
 * Test Scope
 * ----------
 * - QuizRequirementValidator
 * - KnowledgeAvailabilityEvaluator
 * - QuestionValidationPipeline
 *
 * Covered Scenarios
 * -----------------
 * ✓ Distribution sum mismatch validation
 * ✓ Default type and difficulty distribution normalization
 * ✓ Insufficient knowledge chunk capacity evaluation
 * ✓ Single choice question validation rejecting multiple correct options
 * ✓ Duplicate question rejection via semantic comparison
 * ✓ Successful validation for well-formed grounded questions
 *
 * Mocked Dependencies
 * -------------------
 * - QuizQuestionRepo
 */
class QuizGenerationEngineTest {

    private QuizRequirementValidator requirementValidator;
    private KnowledgeAvailabilityEvaluator availabilityEvaluator;
    private QuestionValidationPipeline validationPipeline;
    private QuizQuestionRepo mockQuizQuestionRepo;

    @BeforeEach
    void setUp() {
        requirementValidator = new QuizRequirementValidatorImpl();
        availabilityEvaluator = new KnowledgeAvailabilityEvaluatorImpl();
        mockQuizQuestionRepo = Mockito.mock(QuizQuestionRepo.class);
        validationPipeline = new QuestionValidationPipelineImpl(mockQuizQuestionRepo);
    }

    @Test
    @DisplayName("Should validate requirement total questions and throw exception for invalid distribution total")
    void testRequirementValidationMismatchedDistribution() {
        Map<QuestionType, Integer> invalidTypeDist = Map.of(
                QuestionType.SINGLE_CHOICE, 10,
                QuestionType.MULTIPLE_CHOICE, 10
        );

        GenerateQuizFromDocumentRequest request = GenerateQuizFromDocumentRequest.builder()
                .courseId(UUID.randomUUID())
                .totalQuestions(15) // mismatch with sum=20
                .typeDistribution(invalidTypeDist)
                .build();

        assertThrows(BadRequestException.class, () -> requirementValidator.validateAndNormalize(request));
    }

    @Test
    @DisplayName("Should normalize default type and difficulty distributions when not provided")
    void testRequirementValidationDefaultNormalization() {
        GenerateQuizFromDocumentRequest request = GenerateQuizFromDocumentRequest.builder()
                .courseId(UUID.randomUUID())
                .totalQuestions(10)
                .build();

        QuizRequirementValidator.ValidatedRequirements reqs = requirementValidator.validateAndNormalize(request);
        assertEquals(10, reqs.getTotalQuestions());
        assertNotNull(reqs.getTypeDistribution());
        assertNotNull(reqs.getDifficultyDistribution());

        int typeSum = reqs.getTypeDistribution().values().stream().mapToInt(Integer::intValue).sum();
        int diffSum = reqs.getDifficultyDistribution().values().stream().mapToInt(Integer::intValue).sum();
        assertEquals(10, typeSum);
        assertEquals(10, diffSum);
    }

    @Test
    @DisplayName("Should evaluate capacity as INSUFFICIENT_KNOWLEDGE when requested count exceeds usable capacity")
    void testKnowledgeAvailabilityCapacity() {
        DocumentKnowledgeChunkEntity chunk1 = DocumentKnowledgeChunkEntity.builder()
                .id(UUID.randomUUID())
                .content("TCP is a connection-oriented transport protocol using three-way handshake.")
                .build();

        List<DocumentKnowledgeChunkEntity> chunks = List.of(chunk1);
        KnowledgeAvailabilityEvaluator.CapacityOutcome outcome = availabilityEvaluator.evaluateCapacity(chunks, 20);

        assertEquals(KnowledgeAvailabilityEvaluator.CapacityStatus.INSUFFICIENT_KNOWLEDGE, outcome.getStatus());
        assertTrue(outcome.getUsableCapacity() < 20);
        assertTrue(outcome.getUsableCapacity() >= 1);
    }

    @Test
    @DisplayName("Should reject SINGLE_CHOICE question with multiple correct answers during validation")
    void testQuestionValidationAmbiguousAnswer() {
        GeneratedQuestionContract question = GeneratedQuestionContract.builder()
                .questionType(QuestionType.SINGLE_CHOICE)
                .difficulty(QuestionDifficulty.EASY)
                .content("What protocol is connection-oriented?")
                .points(BigDecimal.valueOf(1.0))
                .options(List.of(
                        new GeneratedQuestionContract.OptionContract("TCP", true),
                        new GeneratedQuestionContract.OptionContract("UDP", true), // Ambiguous: 2 correct answers!
                        new GeneratedQuestionContract.OptionContract("IP", false),
                        new GeneratedQuestionContract.OptionContract("ICMP", false)
                ))
                .build();

        QuestionValidationPipeline.ValidationResult result = validationPipeline.validateQuestion(
                question,
                "TCP is a connection-oriented transport layer protocol.",
                Collections.emptyList(),
                UUID.randomUUID()
        );

        assertFalse(result.isPassed());
        assertEquals(ValidationFailureReason.AMBIGUOUS_ANSWER, result.getFailureReason());
    }

    @Test
    @DisplayName("Should reject duplicate question when semantic similarity exceeds threshold")
    void testQuestionValidationDuplicateDetection() {
        GeneratedQuestionContract existing = GeneratedQuestionContract.builder()
                .questionType(QuestionType.SINGLE_CHOICE)
                .difficulty(QuestionDifficulty.EASY)
                .content("How many steps are in the TCP three-way handshake?")
                .points(BigDecimal.valueOf(1.0))
                .options(List.of(new GeneratedQuestionContract.OptionContract("3 steps", true), new GeneratedQuestionContract.OptionContract("2 steps", false)))
                .build();

        GeneratedQuestionContract duplicateCandidate = GeneratedQuestionContract.builder()
                .questionType(QuestionType.SINGLE_CHOICE)
                .difficulty(QuestionDifficulty.EASY)
                .content("How many steps are in the TCP three-way handshake process?")
                .points(BigDecimal.valueOf(1.0))
                .options(List.of(new GeneratedQuestionContract.OptionContract("3 steps", true), new GeneratedQuestionContract.OptionContract("4 steps", false)))
                .build();

        QuestionValidationPipeline.ValidationResult result = validationPipeline.validateQuestion(
                duplicateCandidate,
                "TCP uses a three-way handshake.",
                List.of(existing),
                UUID.randomUUID()
        );

        assertFalse(result.isPassed());
        assertEquals(ValidationFailureReason.DUPLICATE, result.getFailureReason());
    }

    @Test
    @DisplayName("Should pass validation for well-formed grounded question")
    void testQuestionValidationSuccess() {
        when(mockQuizQuestionRepo.findByCourseId(any())).thenReturn(Collections.emptyList());

        GeneratedQuestionContract question = GeneratedQuestionContract.builder()
                .questionType(QuestionType.SINGLE_CHOICE)
                .difficulty(QuestionDifficulty.EASY)
                .content("What protocol uses a three-way handshake?")
                .points(BigDecimal.valueOf(1.0))
                .options(List.of(
                        new GeneratedQuestionContract.OptionContract("TCP", true),
                        new GeneratedQuestionContract.OptionContract("UDP", false),
                        new GeneratedQuestionContract.OptionContract("HTTP", false),
                        new GeneratedQuestionContract.OptionContract("FTP", false)
                ))
                .build();

        QuestionValidationPipeline.ValidationResult result = validationPipeline.validateQuestion(
                question,
                "TCP uses a three-way handshake to establish a reliable connection.",
                Collections.emptyList(),
                UUID.randomUUID()
        );

        assertTrue(result.isPassed());
        assertNull(result.getFailureReason());
    }
}
