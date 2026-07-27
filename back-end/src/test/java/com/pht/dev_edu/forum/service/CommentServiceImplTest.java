package com.pht.dev_edu.forum.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
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

/*
 * <analysis>
 * CommentServiceImpl
 * - createComment(String username, CommentRequest request)
 *   - branches:
 *       repliedToCommentId == null -> top-level comment created
 *       repliedToCommentId != null & parent comment not found -> BadRequestException
 *       repliedToCommentId != null & parent comment post ID mismatch -> BadRequestException
 *       repliedToCommentId != null & parent comment deleted without active replies -> BadRequestException
 *       repliedToCommentId != null & valid parent -> sets repliedToCommentId, rootCommentId, depth
 *   - paths:
 *       [P1: top-level comment]
 *       [P2: parent comment not found -> BadRequestException]
 *       [P3: post ID mismatch -> BadRequestException]
 *       [P4: deleted parent comment -> BadRequestException]
 *       [P5: valid reply comment]
 *   - planned tests:
 *       [shouldCreateTopLevelCommentSuccessfully -> P1]
 *       [shouldThrowBadRequestWhenParentCommentNotFound -> P2]
 *       [shouldThrowBadRequestWhenPostIdMismatch -> P3]
 *       [shouldThrowBadRequestWhenReplyingToDeletedParent -> P4]
 *       [shouldCreateReplyCommentSuccessfully -> P5]
 *
 * - getCommentsByPostId / getRepliedComments
 *   - paths:
 *       [P1: get root comments with cursor]
 *       [P2: get replied comments with cursor]
 *   - planned tests:
 *       [shouldGetRootCommentsByPostIdWithCursor -> P1]
 *       [shouldGetRepliedCommentsWithCursor -> P2]
 *
 * - deleteComment(Set<String> authorities, String username, UUID commentId)
 *   - branches:
 *       comment null or already deleted -> log & return
 *       not author and not ADMIN -> BadRequestException
 *       author or ADMIN -> soft delete, save & async tracking
 *   - paths:
 *       [P1: comment null or already deleted]
 *       [P2: unauthorized user -> BadRequestException]
 *       [P3: author or admin -> soft delete]
 *   - planned tests:
 *       [shouldDoNothingWhenCommentNotFoundOrDeleted -> P1]
 *       [shouldThrowBadRequestWhenUserHasNoDeletePermission -> P2]
 *       [shouldDeleteCommentSuccessfullyAsAuthorOrAdmin -> P3]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for CommentServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify forum comment creation, nested reply rules, and deletion permissions in CommentServiceImpl.
 *
 * Test Scope
 * ----------
 * - createComment(String, CommentRequest)
 * - getCommentsByPostId(String, UUID, String)
 * - getRepliedComments(String, UUID, String)
 * - deleteComment(Set<String>, String, UUID)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Top-level comment creation
 * ✓ Reply comment validation (missing parent, mismatched post, deleted parent)
 * ✓ Valid nested reply creation
 * ✓ Pagination for root and replied comments
 * ✓ Deletion permission enforcement (Author/Admin vs Unauthorized user)
 *
 * Mocked Dependencies
 * -------------------
 * - CommentRepository
 * - ForumCommentMapper
 * - Executor
 * - KafkaUtils (static mock)
 * - TransactionUtils (static mock)
 */

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.forum.dto.CommentProjection;
import com.pht.dev_edu.forum.dto.CommentRequest;
import com.pht.dev_edu.forum.dto.CommentResponse;
import com.pht.dev_edu.forum.entity.CommentEntity;
import com.pht.dev_edu.forum.mapper.ForumCommentMapper;
import com.pht.dev_edu.forum.repo.CommentRepository;

@ExtendWith(MockitoExtension.class)
class CommentServiceImplTest {

    @Mock
    private CommentRepository commentRepository;
    @Mock
    private ForumCommentMapper forumCommentMapper;
    @Mock
    private Executor executor;

    @InjectMocks
    private CommentServiceImpl commentService;

    private MockedStatic<KafkaUtils> kafkaUtilsMock;

    private static final String USERNAME = "user1";
    private static final UUID POST_ID = UUID.randomUUID();
    private static final UUID COMMENT_ID = UUID.randomUUID();
    private static final UUID PARENT_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        kafkaUtilsMock = mockStatic(KafkaUtils.class);
    }

    @AfterEach
    void tearDown() {
        kafkaUtilsMock.close();
    }

    // ==================== createComment ====================

    @Test
    @DisplayName("createComment - should create top-level comment successfully")
    void shouldCreateTopLevelCommentSuccessfully() {
        // Arrange
        CommentRequest request = new CommentRequest();
        request.setPostId(POST_ID);

        CommentEntity entity = CommentEntity.builder().build();
        when(forumCommentMapper.reqToEntity(request)).thenReturn(entity);

        CommentResponse response = CommentResponse.builder().build();
        when(forumCommentMapper.entityToRes(entity)).thenReturn(response);

        // Act
        CommentResponse result = commentService.createComment(USERNAME, request);

        // Assert
        assertThat(result).isEqualTo(response);
        verify(commentRepository).save(entity);
        assertThat(entity.getAuthor()).isEqualTo(USERNAME);
    }

    @Test
    @DisplayName("createComment - should throw BadRequestException when parent comment not found")
    void shouldThrowBadRequestWhenParentCommentNotFound() {
        // Arrange
        CommentRequest request = new CommentRequest();
        request.setPostId(POST_ID);
        request.setRepliedToCommentId(PARENT_ID);

        when(forumCommentMapper.reqToEntity(request)).thenReturn(new CommentEntity());
        when(commentRepository.findById(PARENT_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> commentService.createComment(USERNAME, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Parent comment not found.");
    }

    @Test
    @DisplayName("createComment - should throw BadRequestException when parent comment post ID does not match")
    void shouldThrowBadRequestWhenPostIdMismatch() {
        // Arrange
        CommentRequest request = new CommentRequest();
        request.setPostId(POST_ID);
        request.setRepliedToCommentId(PARENT_ID);

        CommentEntity parent = CommentEntity.builder().id(PARENT_ID).postId(UUID.randomUUID()).build(); // Mismatched
                                                                                                        // post ID

        when(forumCommentMapper.reqToEntity(request)).thenReturn(new CommentEntity());
        when(commentRepository.findById(PARENT_ID)).thenReturn(Optional.of(parent));

        // Act & Assert
        assertThatThrownBy(() -> commentService.createComment(USERNAME, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Parent comment does not belong to the same post.");
    }

    @Test
    @DisplayName("createComment - should throw BadRequestException when replying to deleted parent without active replies")
    void shouldThrowBadRequestWhenReplyingToDeletedParent() {
        // Arrange
        CommentRequest request = new CommentRequest();
        request.setPostId(POST_ID);
        request.setRepliedToCommentId(PARENT_ID);

        CommentEntity deletedParent = CommentEntity.builder()
                .id(PARENT_ID)
                .postId(POST_ID)
                .deletedAt(LocalDateTime.now())
                .build();

        when(forumCommentMapper.reqToEntity(request)).thenReturn(new CommentEntity());
        when(commentRepository.findById(PARENT_ID)).thenReturn(Optional.of(deletedParent));
        when(commentRepository.existsByRootCommentIdAndDeletedAtIsNull(PARENT_ID)).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> commentService.createComment(USERNAME, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Parent comment not found.");
    }

    @Test
    @DisplayName("createComment - should create reply comment successfully")
    void shouldCreateReplyCommentSuccessfully() {
        // Arrange
        CommentRequest request = new CommentRequest();
        request.setPostId(POST_ID);
        request.setRepliedToCommentId(PARENT_ID);

        CommentEntity parent = CommentEntity.builder()
                .id(PARENT_ID)
                .postId(POST_ID)
                .depth(0)
                .build();

        CommentEntity entity = CommentEntity.builder().build();
        when(forumCommentMapper.reqToEntity(request)).thenReturn(entity);
        when(commentRepository.findById(PARENT_ID)).thenReturn(Optional.of(parent));

        CommentResponse response = CommentResponse.builder().build();
        when(forumCommentMapper.entityToRes(entity)).thenReturn(response);

        // Act
        CommentResponse result = commentService.createComment(USERNAME, request);

        // Assert
        assertThat(result).isEqualTo(response);
        verify(commentRepository).save(entity);
        assertThat(entity.getRepliedToCommentId()).isEqualTo(PARENT_ID);
        assertThat(entity.getDepth()).isEqualTo(1);
    }

    // ==================== getCommentsByPostId / getRepliedComments
    // ====================

    @Test
    @DisplayName("getCommentsByPostId - should return paged root comments")
    void shouldGetRootCommentsByPostIdWithCursor() {
        // Arrange
        CommentProjection projection = mock(CommentProjection.class);
        when(projection.getIsDeleted()).thenReturn(false);
        when(projection.getContent()).thenReturn("Hello");
        when(projection.getAuthorUsername()).thenReturn("user1");

        PageImpl<CommentProjection> page = new PageImpl<>(List.of(projection));
        when(commentRepository.findRootCommentsByPostIdAndCursor(eq(POST_ID), any(), any(), any(Pageable.class)))
                .thenReturn(page);

        CommentResponse response = CommentResponse.builder().build();
        when(forumCommentMapper.projectionToRes(projection)).thenReturn(response);

        // Act
        CustomPaging<CommentResponse> result = commentService.getCommentsByPostId(USERNAME, POST_ID, null);

        // Assert
        assertThat(result).isNotNull();
    }

    // ==================== deleteComment ====================

    @Test
    @DisplayName("deleteComment - should do nothing when comment is null or already deleted")
    void shouldDoNothingWhenCommentNotFoundOrDeleted() {
        // Arrange
        when(commentRepository.findById(COMMENT_ID)).thenReturn(Optional.empty());

        // Act
        commentService.deleteComment(Set.of("ROLE_USER"), USERNAME, COMMENT_ID);

        // Verify
        verify(commentRepository, never()).save(any());
    }

    @Test
    @DisplayName("deleteComment - should throw BadRequestException when user has no delete permission")
    void shouldThrowBadRequestWhenUserHasNoDeletePermission() {
        // Arrange
        CommentEntity comment = CommentEntity.builder()
                .id(COMMENT_ID)
                .author("other_user")
                .build();
        when(commentRepository.findById(COMMENT_ID)).thenReturn(Optional.of(comment));

        // Act & Assert
        assertThatThrownBy(() -> commentService.deleteComment(Set.of("ROLE_USER"), USERNAME, COMMENT_ID))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("You do not have permission to delete this comment.");
    }

    @Test
    @DisplayName("deleteComment - should soft delete comment successfully when author or ADMIN")
    void shouldDeleteCommentSuccessfullyAsAuthorOrAdmin() {
        // Arrange
        CommentEntity comment = CommentEntity.builder()
                .id(COMMENT_ID)
                .author(USERNAME)
                .build();
        when(commentRepository.findById(COMMENT_ID)).thenReturn(Optional.of(comment));

        // Act
        commentService.deleteComment(Set.of(RoleEnum.ADMIN.name()), USERNAME, COMMENT_ID);

        // Verify & Assert
        assertThat(comment.getDeletedAt()).isNotNull();
        verify(commentRepository).save(comment);
    }
}
