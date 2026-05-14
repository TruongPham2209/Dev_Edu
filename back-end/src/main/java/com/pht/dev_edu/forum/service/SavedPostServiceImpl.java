package com.pht.dev_edu.forum.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.TimeStampCursor;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.util.PagingUtils;
import com.pht.dev_edu.forum.dto.SavedPostProjection;
import com.pht.dev_edu.forum.dto.SavedPostResponse;
import com.pht.dev_edu.forum.mapper.SavedPostMapper;
import com.pht.dev_edu.forum.repo.SavedPostRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class SavedPostServiceImpl implements SavedPostService {
    PostService postService;
    SavedPostRepository savedPostRepository;
    SavedPostMapper savedPostMapper;

    @Override
    @Transactional
    public void savePost(String username, UUID postId) {
        var post = postService.getPostById(postId);
        if (post == null) {
            log.error("Post with id {} not found, cannot save", postId);
            throw new BadRequestException("Post not found");
        }

        if (post.getDeletedAt() != null || post.getCurrentVersionId() == null) {
            log.error("Post with id {} is deleted or has no valid version, cannot save", postId);
            throw new BadRequestException("Post not found");
        }

        savedPostRepository.insertSavedPost(username, postId);
    }

    @Override
    @Transactional
    public void unSavePost(String username, UUID postId) {
        savedPostRepository.deleteByPostIdAndUsername(postId, username);
    }

    @Override
    public CustomPaging<SavedPostResponse> getSavedPosts(String username, String nextCursor) {
        var cursor = StringUtils.hasText(nextCursor)
                ? PagingUtils.decodeTimeStampCursor(nextCursor)
                : TimeStampCursor.getDefaultCursor(true);
        var pageable = PageRequest.of(0, 11);

        var savedPostsPage = savedPostRepository.findByUsernameAndCursor(username, cursor.getId(), cursor.getTimeStamp(), pageable);
        return PagingUtils.getPagedWithCursor(
                savedPostsPage,
                savedPostMapper::projectionToRes,
                SavedPostProjection::getSavedAt,
                SavedPostProjection::getId,
                pageable.getPageSize() - 1
        );
    }
}
