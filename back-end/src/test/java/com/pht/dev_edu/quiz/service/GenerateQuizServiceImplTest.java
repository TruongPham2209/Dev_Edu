package com.pht.dev_edu.quiz.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.quiz.dto.request.GenerateQuizRequest;

/*
 * <analysis>
 * GenerateQuizServiceImpl
 * - generateQuiz(GenerateQuizRequest request, String username)
 *   - branches:
 *       always throws BadRequestException as AI Quiz Generation is not enabled
 *   - paths:
 *       [P1: throw BadRequestException]
 *   - planned tests:
 *       [generateQuiz_AlwaysThrowsBadRequestException -> P1]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for GenerateQuizServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify AI quiz generation service disabled guard exception.
 *
 * Test Scope
 * ----------
 * - generateQuiz(GenerateQuizRequest, String)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Throwing BadRequestException when AI quiz generation is invoked
 *
 * Mocked Dependencies
 * -------------------
 * - None
 */
class GenerateQuizServiceImplTest {

    private GenerateQuizServiceImpl generateQuizService;

    @BeforeEach
    void setUp() {
        generateQuizService = new GenerateQuizServiceImpl();
    }

    @Test
    @DisplayName("generateQuiz - should always throw BadRequestException indicating AI feature is disabled")
    void generateQuiz_AlwaysThrowsBadRequestException() {
        GenerateQuizRequest request = new GenerateQuizRequest();
        request.setCourseId(UUID.randomUUID());
        request.setTopic("Java Basics");
        request.setNumberOfQuestions(10);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> generateQuizService.generateQuiz(request, "lecturer1"));

        assertEquals("AI Quiz Generation service is not yet enabled in this environment.", ex.getMessage());
    }
}
