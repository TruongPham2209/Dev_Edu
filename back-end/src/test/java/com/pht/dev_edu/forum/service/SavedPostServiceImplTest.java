package com.pht.dev_edu.forum.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

/*
 * <analysis>
 * SavedPostServiceImpl
 * - savePost(String username, UUID postId)
 *   - branches:
 *       post not found -> BadRequestException
 *       post deleted or has no valid version -> BadRequestException
 *       post valid -> inserts saved post
 *   - paths:
 *       [P1: post null -> BadRequestException]
 *       [P2: post deleted or no version -> BadRequestException]
 *       [P3: post valid -> saved]
 *   - planned tests:
 *       [shouldThrowBadRequestWhenPostNotFoundOnSave -> P1]
 *       [shouldThrowBadRequestWhenPostIsDeletedOrHasNoVersionOnSave -> P2]
 *       [shouldSavePostSuccessfully -> P3]
 *
 * - unSavePost(String username, UUID postId)
 *   - paths:
 *       [P1: calls savedPostRepository.deleteByPostIdAndUsername]
 *   - planned tests:
 *       [shouldUnSavePostSuccessfully -> P1]
 *
 * - getSavedPosts(String username, String nextCursor)
 *   - paths:
 *       [P1: fetches saved posts with cursor]
 *   - planned tests:
 *       [shouldGetSavedPostsWithCursor -> P1]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for SavedPostServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify saved post operations and post state validations in SavedPostServiceImpl.
 *
 * Test Scope
 * ----------
 * - savePost(String, UUID)
 * - unSavePost(String, UUID)
 * - getSavedPosts(String, String)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Save post guard checks (non-existent post, deleted post, missing version)
 * ✓ Successful post saving
 * ✓ Post un-saving
 * ✓ Saved posts pagination
 *
 * Mocked Dependencies
 * -------------------
 * - PostService
 * - SavedPostRepository
 * - SavedPostMapper
 */

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.forum.dto.SavedPostProjection;
import com.pht.dev_edu.forum.dto.SavedPostResponse;
import com.pht.dev_edu.forum.entity.PostEntity;
import com.pht.dev_edu.forum.mapper.SavedPostMapper;
import com.pht.dev_edu.forum.repo.SavedPostRepository;

@ExtendWith(MockitoExtension.class)
class SavedPostServiceImplTest {

    @Mock
    private PostService postService;
    @Mock
    private SavedPostRepository savedPostRepository;
    @Mock
    private SavedPostMapper savedPostMapper;

    @InjectMocks
    private SavedPostServiceImpl savedPostService;

    private static final String USERNAME = "user1";
    private static final UUID POST_ID = UUID.randomUUID();

    @Test
    @DisplayName("savePost - should throw BadRequestException when post not found")
    void shouldThrowBadRequestWhenPostNotFoundOnSave() {
        // Arrange
        when(postService.getPostById(POST_ID)).thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> savedPostService.savePost(USERNAME, POST_ID))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Post not found");
    }

    @Test
    @DisplayName("savePost - should throw BadRequestException when post is deleted or has no valid version")
    void shouldThrowBadRequestWhenPostIsDeletedOrHasNoVersionOnSave() {
        // Arrange
        PostEntity deletedPost = PostEntity.builder()
                .id(POST_ID)
                .deletedAt(LocalDateTime.now())
                .currentVersionId(UUID.randomUUID())
                .build();
        when(postService.getPostById(POST_ID)).thenReturn(deletedPost);

        // Act & Assert
        assertThatThrownBy(() -> savedPostService.savePost(USERNAME, POST_ID))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Post not found");
    }

    @Test
    @DisplayName("savePost - should save post successfully when valid")
    void shouldSavePostSuccessfully() {
        // Arrange
        PostEntity validPost = PostEntity.builder()
                .id(POST_ID)
                .currentVersionId(UUID.randomUUID())
                .build();
        when(postService.getPostById(POST_ID)).thenReturn(validPost);

        // Act
        savedPostService.savePost(USERNAME, POST_ID);

        // Verify
        verify(savedPostRepository).insertSavedPost(USERNAME, POST_ID);
    }

    @Test
    @DisplayName("unSavePost - should remove saved post")
    void shouldUnSavePostSuccessfully() {
        // Act
        savedPostService.unSavePost(USERNAME, POST_ID);

        // Verify
        verify(savedPostRepository).deleteByPostIdAndUsername(POST_ID, USERNAME);
    }

    @Test
    @DisplayName("getSavedPosts - should return paged saved posts")
    void shouldGetSavedPostsWithCursor() {
        // Arrange
        SavedPostProjection projection = mock(SavedPostProjection.class);
        PageImpl<SavedPostProjection> page = new PageImpl<>(List.of(projection));

        when(savedPostRepository.findByUsernameAndCursor(eq(USERNAME), any(), any(), any(Pageable.class)))
                .thenReturn(page);

        SavedPostResponse response = SavedPostResponse.builder().build();
        when(savedPostMapper.projectionToRes(projection)).thenReturn(response);

        // Act
        CustomPaging<SavedPostResponse> result = savedPostService.getSavedPosts(USERNAME, null);

        // Assert
        assertThat(result).isNotNull();
    }
}
