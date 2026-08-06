package com.pht.dev_edu.quiz.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.function.Supplier;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.quiz.dto.response.QuizDetailResponse;
import com.pht.dev_edu.quiz.dto.response.QuizQuestionOptionResponse;
import com.pht.dev_edu.quiz.dto.response.QuizQuestionResponse;
import com.pht.dev_edu.quiz.dto.response.QuizResponse;
import com.pht.dev_edu.quiz.dto.response.QuizTypeConfigResponse;
import com.pht.dev_edu.quiz.entity.QuizEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionOptionEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionTypeConfigEntity;
import com.pht.dev_edu.quiz.mapper.QuizMapper;
import com.pht.dev_edu.quiz.repo.QuizQuestionOptionRepo;
import com.pht.dev_edu.quiz.repo.QuizQuestionRepo;
import com.pht.dev_edu.quiz.repo.QuizQuestionTypeConfigRepo;
import com.pht.dev_edu.quiz.repo.QuizRepo;

/*
 * <analysis>
 * QuizServiceImpl
 * - getQuizEntityOrThrow(UUID quizId)
 *   - branches:
 *       quiz == null -> DataNotFoundException
 *       quiz.deletedAt != null -> DataNotFoundException
 *       quiz valid -> return QuizEntity
 *   - paths:
 *       [P1: quiz null -> DataNotFoundException]
 *       [P2: quiz deleted -> DataNotFoundException]
 *       [P3: valid quiz -> return entity]
 *   - planned tests:
 *       [getQuizEntityOrThrow_WhenQuizNotFound_ThrowsDataNotFoundException -> P1]
 *       [getQuizEntityOrThrow_WhenQuizDeleted_ThrowsDataNotFoundException -> P2]
 *       [getQuizEntityOrThrow_WhenQuizValid_ReturnsQuiz -> P3]
 *
 * - getQuizEntity(UUID quizId)
 *   - branches:
 *       delegates to RedisUtils.getOptionalDataFromCacheOrDb
 *   - paths:
 *       [P1: delegate to cache/db]
 *   - planned tests:
 *       [getQuizEntity_DelegatesToRedisUtils -> P1]
 *
 * - getQuizDetailResponseFromCache(UUID quizId)
 *   - branches:
 *       delegates to RedisUtils.getDataFromCacheOrDb and aggregates quiz, type configs, questions, and options
 *   - paths:
 *       [P1: cache/db fetch & mapping]
 *   - planned tests:
 *       [getQuizDetailResponseFromCache_ExecutesDbCallAndBuildsDetailResponse -> P1]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for QuizServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify entity retrieval, soft-delete checks, and detail response caching
 * logic in QuizServiceImpl.
 *
 * Test Scope
 * ----------
 * - getQuizEntityOrThrow(UUID)
 * - getQuizEntity(UUID)
 * - getQuizDetailResponseFromCache(UUID)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Handling non-existent and soft-deleted QuizEntity lookups
 * ✓ Successful QuizEntity retrieval
 * ✓ Redis cache delegation via RedisUtils
 * ✓ Quiz detail response aggregation (type configs, questions, options mapping)
 *
 * Mocked Dependencies
 * -------------------
 * - QuizRepo
 * - QuizQuestionTypeConfigRepo
 * - QuizQuestionRepo
 * - QuizQuestionOptionRepo
 * - QuizMapper
 * - RedisUtils (static mock)
 */
@ExtendWith(MockitoExtension.class)
class QuizServiceImplTest {

    @Mock
    QuizRepo quizRepo;
    @Mock
    QuizQuestionTypeConfigRepo typeConfigRepo;
    @Mock
    QuizQuestionRepo questionRepo;
    @Mock
    QuizQuestionOptionRepo optionRepo;
    @Mock
    QuizMapper quizMapper;

    @InjectMocks
    QuizServiceImpl quizService;

    private MockedStatic<RedisUtils> redisUtilsMock;
    private UUID quizId;
    private UUID questionId;

    @BeforeEach
    void setUp() {
        quizId = UUID.randomUUID();
        questionId = UUID.randomUUID();
        redisUtilsMock = mockStatic(RedisUtils.class);
    }

    @AfterEach
    void tearDown() {
        redisUtilsMock.close();
    }

    @Test
    @DisplayName("getQuizEntityOrThrow - when quiz not found, should throw DataNotFoundException")
    void getQuizEntityOrThrow_WhenQuizNotFound_ThrowsDataNotFoundException() {
        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                any(), eq(QuizEntity.class), any(), any()))
                .thenReturn(null);

        assertThrows(DataNotFoundException.class, () -> quizService.getQuizEntityOrThrow(quizId));
    }

    @Test
    @DisplayName("getQuizEntityOrThrow - when quiz soft-deleted, should throw DataNotFoundException")
    void getQuizEntityOrThrow_WhenQuizDeleted_ThrowsDataNotFoundException() {
        QuizEntity deletedQuiz = QuizEntity.builder()
                .id(quizId)
                .deletedAt(LocalDateTime.now())
                .build();

        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                any(), eq(QuizEntity.class), any(), any()))
                .thenReturn(deletedQuiz);

        assertThrows(DataNotFoundException.class, () -> quizService.getQuizEntityOrThrow(quizId));
    }

    @Test
    @DisplayName("getQuizEntityOrThrow - when quiz valid, should return QuizEntity")
    void getQuizEntityOrThrow_WhenQuizValid_ReturnsQuiz() {
        QuizEntity validQuiz = QuizEntity.builder()
                .id(quizId)
                .title("Sample Quiz")
                .build();

        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                any(), eq(QuizEntity.class), any(), any()))
                .thenReturn(validQuiz);

        QuizEntity result = quizService.getQuizEntityOrThrow(quizId);

        assertNotNull(result);
        assertEquals(quizId, result.getId());
    }

    @Test
    @DisplayName("getQuizEntity - should delegate to RedisUtils cache/db call")
    void getQuizEntity_DelegatesToRedisUtils() {
        QuizEntity mockQuiz = QuizEntity.builder().id(quizId).build();
        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                any(), eq(QuizEntity.class), any(), any()))
                .thenReturn(mockQuiz);

        QuizEntity result = quizService.getQuizEntity(quizId);

        assertEquals(mockQuiz, result);
    }

    @Test
    @DisplayName("getQuizDetailResponseFromCache - should build detail response with questions and options")
    void getQuizDetailResponseFromCache_ExecutesDbCallAndBuildsDetailResponse() {
        redisUtilsMock.when(() -> RedisUtils.getDataFromCacheOrDb(
                any(), eq(QuizDetailResponse.class), any(), any()))
                .thenAnswer(invocation -> {
                    Supplier<QuizDetailResponse> dbCall = invocation.getArgument(2);
                    return dbCall.get();
                });

        QuizEntity quiz = QuizEntity.builder().id(quizId).title("Java Basics").build();
        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                any(), eq(QuizEntity.class), any(), any()))
                .thenReturn(quiz);

        QuizQuestionTypeConfigEntity typeConfig = QuizQuestionTypeConfigEntity.builder().id(UUID.randomUUID()).build();
        QuizQuestionEntity question = QuizQuestionEntity.builder().id(questionId).quizId(quizId).build();
        QuizQuestionOptionEntity option = QuizQuestionOptionEntity.builder().id(UUID.randomUUID())
                .questionId(questionId).build();

        when(typeConfigRepo.findByQuizId(quizId)).thenReturn(List.of(typeConfig));
        when(questionRepo.findByQuizIdAndDeletedAtIsNullOrderByOrderIndexAsc(quizId)).thenReturn(List.of(question));
        when(optionRepo.findByQuestionIdInAndDeletedAtIsNullOrderByOrderIndexAsc(List.of(questionId)))
                .thenReturn(List.of(option));

        when(quizMapper.toResponse(quiz)).thenReturn(QuizResponse.builder().id(quizId).title("Java Basics").build());
        when(quizMapper.toTypeConfigResponseList(List.of(typeConfig)))
                .thenReturn(List.of(QuizTypeConfigResponse.builder().build()));
        when(quizMapper.toResponse(question)).thenReturn(QuizQuestionResponse.builder().id(questionId).build());
        when(quizMapper.toOptionResponseList(List.of(option)))
                .thenReturn(List.of(QuizQuestionOptionResponse.builder().build()));

        QuizDetailResponse result = quizService.getQuizDetailResponseFromCache(quizId);

        assertNotNull(result);
        assertNotNull(result.getQuiz());
        assertEquals(quizId, result.getQuiz().getId());
        assertEquals(1, result.getQuestions().size());
        assertEquals(1, result.getTypeConfigs().size());
    }
}
