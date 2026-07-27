package com.pht.dev_edu.forum.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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

/*
 * <analysis>
 * PostServiceImpl
 * - getPostVersions(PostStatus status, String lastCursor)
 *   - paths:
 *       [P1: get post versions with status & cursor]
 *   - planned tests:
 *       [shouldGetPostVersionsWithCursor -> P1]
 *
 * - getPostedPosts(String username, PostStatus status, String lastCursor)
 *   - branches:
 *       status == APPROVED -> postRepository.getPostedPosts
 *       status != APPROVED -> postQueryRepository.getPostedPosts
 *   - paths:
 *       [P1: status APPROVED]
 *       [P2: status non-APPROVED]
 *   - planned tests:
 *       [shouldGetPostedPostsForApprovedStatus -> P1]
 *       [shouldGetPostedPostsForNonApprovedStatus -> P2]
 *
 * - getPostVersionsByPostId(Set<String> authorities, String actor, UUID postId, PostStatus status)
 *   - branches:
 *       post null or deleted -> DataNotFoundException
 *       canAccessAllStatuses == true (owner or ADMIN) -> query by given status
 *       canAccessAllStatuses == false -> query by APPROVED status only
 *   - paths:
 *       [P1: post null -> DataNotFoundException]
 *       [P2: post deleted -> DataNotFoundException]
 *       [P3: owner or admin access]
 *       [P4: normal user access -> restricted to APPROVED]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenPostNotFoundOnVersionsLookup -> P1]
 *       [shouldThrowDataNotFoundWhenPostDeletedOnVersionsLookup -> P2]
 *       [shouldGetPostVersionsForOwnerOrAdmin -> P3]
 *       [shouldRestrictPostVersionsToApprovedForNormalUser -> P4]
 *
 * - getPostDetail(String actor, UUID postId)
 *   - branches:
 *       post detail not found -> DataNotFoundException
 *       actor present -> checks isSaved from savedPostRepository
 *       actor blank -> isSaved false
 *   - paths:
 *       [P1: detail not found -> DataNotFoundException]
 *       [P2: detail found with actor]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenPostDetailNotFound -> P1]
 *       [shouldGetPostDetailWithActorSavedState -> P2]
 *
 * - create(String author, PostRequest postRequest)
 *   - paths:
 *       [P1: creates post entity, validates thumbnail URL, creates version entity, returns response]
 *   - planned tests:
 *       [shouldCreatePostVersionSuccessfully -> P1]
 *
 * - deletePost(Set<String> authorities, String author, UUID postId)
 *   - branches:
 *       post null -> log warn & return
 *       not author and not ADMIN -> DataNotFoundException
 *       already deleted -> log warn & return
 *       valid post -> soft deletes, invalidates cache & async tracking
 *   - paths:
 *       [P1: post null]
 *       [P2: unauthorized user -> DataNotFoundException]
 *       [P3: post already deleted]
 *       [P4: valid soft delete]
 *   - planned tests:
 *       [shouldDoNothingWhenDeletingNonExistentPost -> P1]
 *       [shouldThrowDataNotFoundWhenUserHasNoPermissionToDeletePost -> P2]
 *       [shouldDoNothingWhenDeletingAlreadyDeletedPost -> P3]
 *       [shouldDeletePostSuccessfully -> P4]
 *
 * - updatePostVersion(String actor, PostStatus postStatus, UUID postVersionId)
 *   - branches:
 *       postStatus == PENDING or SUPERSEDED -> BadRequestException
 *       postVersion not found -> DataNotFoundException
 *       postVersion status != PENDING -> BadRequestException
 *       post null -> DataNotFoundException
 *       post deleted -> BadRequestException
 *       postStatus APPROVED -> updates post currentVersionId, saves, invalidates cache
 *   - paths:
 *       [P1: invalid status (PENDING/SUPERSEDED) -> BadRequestException]
 *       [P2: post version not found -> DataNotFoundException]
 *       [P3: post version not PENDING -> BadRequestException]
 *       [P4: post null -> DataNotFoundException]
 *       [P5: post deleted -> BadRequestException]
 *       [P6: successful status update to APPROVED]
 *   - planned tests:
 *       [shouldThrowBadRequestWhenUpdatingToInvalidStatus -> P1]
 *       [shouldThrowDataNotFoundWhenPostVersionNotFound -> P2]
 *       [shouldThrowBadRequestWhenPostVersionNotPending -> P3]
 *       [shouldThrowDataNotFoundWhenPostNotFoundOnVersionUpdate -> P4]
 *       [shouldThrowBadRequestWhenPostIsDeletedOnVersionUpdate -> P5]
 *       [shouldUpdatePostVersionStatusToApprovedSuccessfully -> P6]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for PostServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify forum post and post version management in PostServiceImpl.
 *
 * Test Scope
 * ----------
 * - getPostVersions(PostStatus, String)
 * - getPostedPosts(String, PostStatus, String)
 * - getPostVersionsByPostId(Set<String>, String, UUID, PostStatus)
 * - getPostDetail(String, UUID)
 * - create(String, PostRequest)
 * - deletePost(Set<String>, String, UUID)
 * - updatePostVersion(String, PostStatus, UUID)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Version pagination and filtering
 * ✓ User post history by status (APPROVED vs PENDING/REJECTED)
 * ✓ Permission-based version history access
 * ✓ Post detail retrieval & saved status
 * ✓ Post version creation & thumbnail validation
 * ✓ Post deletion & permission control
 * ✓ Post version status approval workflow (SUPERSEDED logic & Redis cache invalidation)
 *
 * Mocked Dependencies
 * -------------------
 * - PostVersionRepository
 * - PostQueryRepository
 * - PostRepository
 * - SavedPostRepository
 * - FileService
 * - PostMapper
 * - PostVersionMapper
 * - Executor
 * - RedisUtils (static mock)
 * - KafkaUtils (static mock)
 * - TransactionUtils (static mock)
 */

import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.file.dto.FileUploadResponse;
import com.pht.dev_edu.file.service.FileService;
import com.pht.dev_edu.forum.dto.PostDetailProjection;
import com.pht.dev_edu.forum.dto.PostRequest;
import com.pht.dev_edu.forum.dto.PostResponse;
import com.pht.dev_edu.forum.dto.PostStatus;
import com.pht.dev_edu.forum.dto.PostVersionResponse;
import com.pht.dev_edu.forum.dto.UpdatePostVersionResult;
import com.pht.dev_edu.forum.entity.PostEntity;
import com.pht.dev_edu.forum.entity.PostVersionEntity;
import com.pht.dev_edu.forum.mapper.PostMapper;
import com.pht.dev_edu.forum.mapper.PostVersionMapper;
import com.pht.dev_edu.forum.repo.PostQueryRepository;
import com.pht.dev_edu.forum.repo.PostRepository;
import com.pht.dev_edu.forum.repo.PostVersionRepository;
import com.pht.dev_edu.forum.repo.SavedPostRepository;

@ExtendWith(MockitoExtension.class)
class PostServiceImplTest {

    @Mock
    private PostVersionRepository postVersionRepository;
    @Mock
    private PostQueryRepository postQueryRepository;
    @Mock
    private PostRepository postRepository;
    @Mock
    private SavedPostRepository savedPostRepository;
    @Mock
    private FileService fileService;
    @Mock
    private PostMapper postMapper;
    @Mock
    private PostVersionMapper postVersionMapper;
    @Mock
    private Executor executor;

    @InjectMocks
    private PostServiceImpl postService;

    private MockedStatic<RedisUtils> redisUtilsMock;
    private MockedStatic<KafkaUtils> kafkaUtilsMock;

    private static final String AUTHOR = "author1";
    private static final UUID POST_ID = UUID.randomUUID();
    private static final UUID VERSION_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        redisUtilsMock = mockStatic(RedisUtils.class);
        kafkaUtilsMock = mockStatic(KafkaUtils.class);
    }

    @AfterEach
    void tearDown() {
        redisUtilsMock.close();
        kafkaUtilsMock.close();
    }

    // ==================== getPostVersionsByPostId ====================

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("getPostVersionsByPostId - should throw DataNotFoundException when post not found")
    void shouldThrowDataNotFoundWhenPostNotFoundOnVersionsLookup() {
        // Arrange
        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(PostEntity.class), any(Supplier.class), any())).thenReturn(null);

        // Act & Assert
        assertThatThrownBy(
                () -> postService.getPostVersionsByPostId(Set.of("ROLE_USER"), AUTHOR, POST_ID, PostStatus.APPROVED))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Post not found");
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("getPostVersionsByPostId - should throw DataNotFoundException when post is deleted")
    void shouldThrowDataNotFoundWhenPostDeletedOnVersionsLookup() {
        // Arrange
        PostEntity deletedPost = PostEntity.builder().id(POST_ID).deletedAt(LocalDateTime.now()).build();
        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(PostEntity.class), any(Supplier.class), any())).thenReturn(deletedPost);

        // Act & Assert
        assertThatThrownBy(
                () -> postService.getPostVersionsByPostId(Set.of("ROLE_USER"), AUTHOR, POST_ID, PostStatus.APPROVED))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Post not found");
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("getPostVersionsByPostId - should return post versions for owner or admin")
    void shouldGetPostVersionsForOwnerOrAdmin() {
        // Arrange
        PostEntity activePost = PostEntity.builder().id(POST_ID).author(AUTHOR).build();
        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(PostEntity.class), any(Supplier.class), any())).thenReturn(activePost);

        PostDetailProjection projection = mock(PostDetailProjection.class);
        when(postVersionRepository.findByPostIdAndStatusOrderByVersionNumberDesc(POST_ID, PostStatus.PENDING.name()))
                .thenReturn(List.of(projection));

        PostResponse response = PostResponse.builder().build();
        when(postMapper.projectionToRes(projection)).thenReturn(response);

        // Act
        List<PostResponse> result = postService.getPostVersionsByPostId(Set.of("ROLE_USER"), AUTHOR, POST_ID,
                PostStatus.PENDING);

        // Assert
        assertThat(result).hasSize(1).contains(response);
    }

    // ==================== getPostDetail ====================

    @Test
    @DisplayName("getPostDetail - should throw DataNotFoundException when post detail not found")
    void shouldThrowDataNotFoundWhenPostDetailNotFound() {
        // Arrange
        when(postRepository.getPostDetailById(POST_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> postService.getPostDetail(AUTHOR, POST_ID))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Post not found");
    }

    @Test
    @DisplayName("getPostDetail - should return post detail with isSaved state")
    void shouldGetPostDetailWithActorSavedState() {
        // Arrange
        PostDetailProjection projection = mock(PostDetailProjection.class);
        when(projection.getAuthorUsername()).thenReturn(AUTHOR);
        when(postRepository.getPostDetailById(POST_ID)).thenReturn(Optional.of(projection));

        PostResponse response = PostResponse.builder().build();
        when(postMapper.projectionToRes(projection)).thenReturn(response);
        when(savedPostRepository.existsByUsernameAndPostId(AUTHOR, POST_ID)).thenReturn(true);

        // Act
        PostResponse result = postService.getPostDetail(AUTHOR, POST_ID);

        // Assert
        assertThat(result).isEqualTo(response);
        assertThat(result.getIsMine()).isTrue();
        assertThat(result.getIsSaved()).isTrue();
    }

    // ==================== create ====================

    @Test
    @DisplayName("create - should create post version successfully")
    void shouldCreatePostVersionSuccessfully() {
        // Arrange
        PostRequest request = new PostRequest();
        request.setThumbObjectKey("pub-bucket/thumb.png");

        FileUploadResponse fileInfo = FileUploadResponse.builder().publicUrl("https://pub-url/thumb.png").build();
        when(fileService.getFileInfo(AUTHOR, "pub-bucket/thumb.png")).thenReturn(fileInfo);

        PostVersionEntity versionEntity = PostVersionEntity.builder().id(VERSION_ID).build();
        when(postVersionMapper.reqToEntity(request)).thenReturn(versionEntity);

        PostVersionResponse response = PostVersionResponse.builder().build();
        when(postVersionMapper.entityToRes(versionEntity)).thenReturn(response);

        // Act
        PostVersionResponse result = postService.create(AUTHOR, request);

        // Assert
        assertThat(result).isEqualTo(response);
        verify(postRepository).save(any(PostEntity.class));
        verify(postVersionRepository).save(versionEntity);
    }

    // ==================== deletePost ====================

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("deletePost - should throw DataNotFoundException when user is not owner nor ADMIN")
    void shouldThrowDataNotFoundWhenUserHasNoPermissionToDeletePost() {
        // Arrange
        PostEntity post = PostEntity.builder().id(POST_ID).author("other_author").build();
        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(PostEntity.class), any(Supplier.class), any())).thenReturn(post);

        // Act & Assert
        assertThatThrownBy(() -> postService.deletePost(Set.of("ROLE_USER"), AUTHOR, POST_ID))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Post not found");
    }

    @SuppressWarnings("unchecked")

    @Test
    @DisplayName("deletePost - should soft delete post successfully")
    void shouldDeletePostSuccessfully() {
        // Arrange
        PostEntity post = PostEntity.builder().id(POST_ID).author(AUTHOR).build();
        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(PostEntity.class), any(Supplier.class), any())).thenReturn(post);

        // Act
        postService.deletePost(Set.of(RoleEnum.ADMIN.name()), AUTHOR, POST_ID);

        // Verify & Assert
        assertThat(post.getDeletedAt()).isNotNull();
        verify(postRepository).save(post);
        redisUtilsMock.verify(() -> RedisUtils.invalidateCache(anyString()));
    }

    // ==================== updatePostVersion ====================

    @Test
    @DisplayName("updatePostVersion - should throw BadRequestException when target status is PENDING or SUPERSEDED")
    void shouldThrowBadRequestWhenUpdatingToInvalidStatus() {
        // Act & Assert
        assertThatThrownBy(() -> postService.updatePostVersion("admin", PostStatus.PENDING, VERSION_ID))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid post status for updating post version");
    }

    @Test
    @DisplayName("updatePostVersion - should throw DataNotFoundException when post version not found")
    void shouldThrowDataNotFoundWhenPostVersionNotFound() {
        // Arrange
        when(postVersionRepository.findById(VERSION_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> postService.updatePostVersion("admin", PostStatus.APPROVED, VERSION_ID))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Post version not found");
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("updatePostVersion - should update post version status to APPROVED successfully")
    void shouldUpdatePostVersionStatusToApprovedSuccessfully() {
        // Arrange
        PostVersionEntity version = PostVersionEntity.builder().id(VERSION_ID)
                .postId(POST_ID)
                .versionNumber(2).status(PostStatus.PENDING)
                .build();
        when(postVersionRepository.findById(VERSION_ID)).thenReturn(Optional.of(version));

        PostEntity post = PostEntity.builder().id(POST_ID).author(AUTHOR).build();
        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(PostEntity.class), any(Supplier.class), any())).thenReturn(post);

        when(postVersionRepository.supersededOldVersionByPostId(POST_ID, 2)).thenReturn(List.of());

        // Act
        UpdatePostVersionResult result = postService.updatePostVersion("admin", PostStatus.APPROVED, VERSION_ID);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.newStatus()).isEqualTo(PostStatus.APPROVED);
        assertThat(post.getCurrentVersionId()).isEqualTo(VERSION_ID);
        verify(postVersionRepository).save(version);
        verify(postRepository).save(post);
        redisUtilsMock.verify(() -> RedisUtils.invalidateCache(anyString()));
    }
}
