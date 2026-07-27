package com.pht.dev_edu.lecture.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Executor;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

/*
 * <analysis>
 * CommentServiceImpl (Lecture)
 * - getComments(Set<String> authorities, String actor, CommentPageRequest req)
 *   - branches:
 *       parentCommentId == null -> fetches root comments
 *       parentCommentId != null & parent not found -> DataNotFoundException
 *       parentCommentId != null & parent depth == MAX_COMMENT_DEPTH -> BadRequestException
 *       parentCommentId != null & valid parent -> fetches replies based on depth
 *   - paths:
 *       [P1: root comments]
 *       [P2: parent comment not found -> DataNotFoundException]
 *       [P3: max depth reached -> BadRequestException]
 *   - planned tests:
 *       [shouldGetRootCommentsSuccessfully -> P1]
 *       [shouldThrowDataNotFoundWhenParentCommentNotFound -> P2]
 *       [shouldThrowBadRequestWhenParentCommentReachedMaxDepth -> P3]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for CommentServiceImpl (Lecture)
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify lecture Q&A comment retrieval and depth limits in CommentServiceImpl.
 *
 * Test Scope
 * ----------
 * - getComments(Set<String>, String, CommentPageRequest)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Root comment paging
 * ✓ Parent comment lookup and exception handling
 * ✓ Maximum comment depth enforcement
 *
 * Mocked Dependencies
 * -------------------
 * - LectureCommentRepository
 * - LectureCommentMapper
 * - LecturePermissionService
 * - Executor
 * - RedisUtils (static mock)
 */

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.lecture.dto.CommentPageRequest;
import com.pht.dev_edu.lecture.dto.CommentProjection;
import com.pht.dev_edu.lecture.dto.CommentResponse;
import com.pht.dev_edu.lecture.entity.LectureCommentEntity;
import com.pht.dev_edu.lecture.mapper.LectureCommentMapper;
import com.pht.dev_edu.lecture.repo.LectureCommentRepository;

@ExtendWith(MockitoExtension.class)
class CommentServiceImplTest {

    @Mock
    private LectureCommentRepository lectureCommentRepository;
    @Mock
    private LectureCommentMapper commentMapper;
    @Mock
    private LecturePermissionService lecturePermissionService;
    @Mock
    private Executor executor;

    @InjectMocks
    private CommentServiceImpl commentService;

    private MockedStatic<RedisUtils> redisUtilsMock;

    private static final String ACTOR = "user1";
    private static final UUID LECTURE_ID = UUID.randomUUID();
    private static final UUID PARENT_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        redisUtilsMock = mockStatic(RedisUtils.class);
    }

    @AfterEach
    void tearDown() {
        redisUtilsMock.close();
    }

    @Test
    @DisplayName("getComments - should return paged root comments when parentCommentId is null")
    void shouldGetRootCommentsSuccessfully() {
        // Arrange
        CommentPageRequest request = new CommentPageRequest();
        request.setLectureId(LECTURE_ID);

        CommentProjection projection = mock(CommentProjection.class);
        when(projection.getIsDeleted()).thenReturn(false);
        when(projection.getContent()).thenReturn("Sample question");
        when(projection.getAuthorUsername()).thenReturn(ACTOR);

        PageImpl<CommentProjection> page = new PageImpl<>(List.of(projection));
        when(lectureCommentRepository.findRootCommentsByLectureId(eq(LECTURE_ID), any(), any(), any(Pageable.class)))
                .thenReturn(page);

        CommentResponse response = CommentResponse.builder().build();
        when(commentMapper.projectionToRes(projection)).thenReturn(response);

        // Act
        CustomPaging<CommentResponse> result = commentService.getComments(Set.of("ROLE_USER"), ACTOR, request);

        // Assert
        assertThat(result).isNotNull();
        verify(lecturePermissionService).checkViewPermissionByLecture(Set.of("ROLE_USER"), ACTOR, LECTURE_ID);
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("getComments - should throw DataNotFoundException when parent comment not found")
    void shouldThrowDataNotFoundWhenParentCommentNotFound() {
        // Arrange
        CommentPageRequest request = new CommentPageRequest();
        request.setLectureId(LECTURE_ID);
        request.setParentCommentId(PARENT_ID);

        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(LectureCommentEntity.class), any(Supplier.class), any())).thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> commentService.getComments(Set.of("ROLE_USER"), ACTOR, request))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Parent comment not found");
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("getComments - should throw BadRequestException when parent comment reached max depth")
    void shouldThrowBadRequestWhenParentCommentReachedMaxDepth() {
        // Arrange
        CommentPageRequest request = new CommentPageRequest();
        request.setLectureId(LECTURE_ID);
        request.setParentCommentId(PARENT_ID);

        LectureCommentEntity parentComment = LectureCommentEntity.builder()
                .id(PARENT_ID)
                .depth(2) // MAX_COMMENT_DEPTH
                .build();
        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(LectureCommentEntity.class), any(Supplier.class), any())).thenReturn(parentComment);

        // Act & Assert
        assertThatThrownBy(() -> commentService.getComments(Set.of("ROLE_USER"), ACTOR, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Parent comment has reached max depth, cannot get replies");
    }
}
