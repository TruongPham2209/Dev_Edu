package com.pht.dev_edu.quiz.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.mockito.Mockito;

import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.quiz.dto.request.GenerateQuizRequest;
import com.pht.dev_edu.quiz.dto.response.QuizGenerationJobResponse;
import com.pht.dev_edu.quiz.dto.response.QuizResponse;
import com.pht.dev_edu.quiz.engine.QuizGenerationPipeline;
import com.pht.dev_edu.quiz.entity.QuizEntity;
import com.pht.dev_edu.quiz.mapper.QuizMapper;
import com.pht.dev_edu.quiz.repo.QuizRepo;

/*
 * <analysis>
 * GenerateQuizServiceImpl
 * - generateQuiz(GenerateQuizRequest request, String username)
 *   - branches:
 *       if request == null or request.getCourseId() == null -> throw BadRequestException
 *       else -> start generation pipeline job, fetch result quiz entity, map to QuizResponse
 *   - paths:
 *       [P1: request is null or courseId is null -> BadRequestException]
 *       [P2: valid request -> delegate to pipeline and return generated QuizResponse]
 *   - planned tests:
 *       [generateQuiz_InvalidRequest -> P1]
 *       [generateQuiz_Success -> P2]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for GenerateQuizServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify AI Quiz generation delegation, request validation, and pipeline result mapping.
 *
 * Test Scope
 * ----------
 * - generateQuiz(GenerateQuizRequest, String)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Invalid request guard clause (null request or null courseId)
 * ✓ Successful generation job initiation and result mapping to QuizResponse
 *
 * Mocked Dependencies
 * -------------------
 * - QuizGenerationPipeline
 * - QuizRepo
 * - QuizMapper
 */
class GenerateQuizServiceImplTest {

    private QuizGenerationPipeline mockPipeline;
    private QuizRepo mockQuizRepo;
    private QuizMapper quizMapper;
    private GenerateQuizServiceImpl generateQuizService;

    @BeforeEach
    void setUp() {
        mockPipeline = Mockito.mock(QuizGenerationPipeline.class);
        mockQuizRepo = Mockito.mock(QuizRepo.class);
        quizMapper = Mappers.getMapper(QuizMapper.class);
        generateQuizService = new GenerateQuizServiceImpl(mockPipeline, mockQuizRepo, quizMapper);
    }

    @Test
    @DisplayName("generateQuiz - should throw BadRequestException when null request or null courseId provided")
    void generateQuiz_InvalidRequest() {
        assertThrows(BadRequestException.class, () -> generateQuizService.generateQuiz(null, "lecturer1"));

        GenerateQuizRequest emptyReq = new GenerateQuizRequest();
        assertThrows(BadRequestException.class, () -> generateQuizService.generateQuiz(emptyReq, "lecturer1"));
    }

    @Test
    @DisplayName("generateQuiz - should start pipeline job and return quiz response if resulting quiz exists")
    void generateQuiz_Success() {
        UUID courseId = UUID.randomUUID();
        UUID quizId = UUID.randomUUID();
        UUID jobId = UUID.randomUUID();

        GenerateQuizRequest request = new GenerateQuizRequest();
        request.setCourseId(courseId);
        request.setTopic("Java Basics");
        request.setNumberOfQuestions(10);

        QuizGenerationJobResponse jobResponse = QuizGenerationJobResponse.builder()
                .jobId(jobId)
                .courseId(courseId)
                .resultQuizId(quizId)
                .build();

        QuizEntity quizEntity = QuizEntity.builder().id(quizId).title("Test Quiz").build();

        when(mockPipeline.startGenerationJob(any(), eq(null), eq("lecturer1"))).thenReturn(jobResponse);
        when(mockQuizRepo.findById(quizId)).thenReturn(Optional.of(quizEntity));

        QuizResponse actual = generateQuizService.generateQuiz(request, "lecturer1");

        assertNotNull(actual);
        assertEquals(quizId, actual.getId());
        assertEquals("Test Quiz", actual.getTitle());
    }
}
