package com.pht.dev_edu.forum.service;

import com.pht.dev_edu.common.constant.EventTrackingConstant;
import com.pht.dev_edu.common.constant.RedisDurationConstant;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.dto.TimeStampCursor;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.common.util.PagingUtils;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.common.util.TransactionUtils;
import com.pht.dev_edu.file.service.FileService;
import com.pht.dev_edu.forum.dto.*;
import com.pht.dev_edu.forum.entity.PostEntity;
import com.pht.dev_edu.forum.mapper.PostMapper;
import com.pht.dev_edu.forum.mapper.PostVersionMapper;
import com.pht.dev_edu.forum.repo.PostQueryRepository;
import com.pht.dev_edu.forum.repo.PostRepository;
import com.pht.dev_edu.forum.repo.PostVersionRepository;
import com.pht.dev_edu.tracking.dto.TrackingEvent;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Executor;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class PostServiceImpl implements PostService {
    PostVersionRepository postVersionRepository;
    PostQueryRepository postQueryRepository;
    PostRepository postRepository;

    FileService fileService;
    PostMapper postMapper;
    PostVersionMapper postVersionMapper;
    Executor executor;

    @Override
    public CustomPaging<PostResponse> getPostVersions(PostStatus status, String lastCursor) {
        var pageable = PageRequest.of(0, 11, Sort.by(Sort.Direction.DESC, "updated_at").and(Sort.by(Sort.Direction.DESC, "id")));
        TimeStampCursor cursor = !StringUtils.hasText(lastCursor)
                ? TimeStampCursor.getDefaultCursor(true)
                : PagingUtils.decodeTimeStampCursor(lastCursor);
        var postVersionPage = postVersionRepository.findByStatusAndCursor(status.name(), cursor.getId(), cursor.getTimeStamp(), pageable);

        return PagingUtils.getPagedWithCursor(
                postVersionPage,
                postMapper::projectionToRes,
                PostDetailProjection::getUpdatedAt,
                PostDetailProjection::getId,
                pageable.getPageSize() - 1
        );
    }

    @Override
    public CustomPaging<PostResponse> getPostedPosts(String username, PostStatus status, String lastCursor) {
        int defaultPageSize = 11;
        var pageable = PageRequest.of(0, defaultPageSize);
        TimeStampCursor cursor = !StringUtils.hasText(lastCursor)
                ? TimeStampCursor.getDefaultCursor(true)
                : PagingUtils.decodeTimeStampCursor(lastCursor);

        if (status == PostStatus.APPROVED) {
            var postPage = postRepository.getPostedPosts(username, cursor.getTimeStamp(), cursor.getId(), pageable);
            return PagingUtils.getPagedWithCursor(
                    postPage,
                    postMapper::projectionToRes,
                    PostDetailProjection::getUpdatedAt,
                    PostDetailProjection::getId,
                    pageable.getPageSize() - 1
            );
        }

        var postPage = postQueryRepository.getPostedPosts(username, status, cursor.getTimeStamp(), cursor.getId(), defaultPageSize);

        return PagingUtils.getPagedWithCursor(
                postPage,
                postMapper::infoToRes,
                PostInfoProjection::updatedAt,
                PostInfoProjection::id,
                pageable.getPageSize() - 1
        );
    }

    @Override
    public List<PostResponse> getPostVersionsByPostId(Set<String> authorities, String actor, UUID postId, PostStatus status) {
        var post = getPostById(postId);
        if (post == null) {
            log.warn("Post {} not found", postId);
            throw new DataNotFoundException("Post not found");
        }

        if (post.getDeletedAt() != null) {
            log.warn("Post {} is deleted, cannot access versions for author {}", postId, actor);
            throw new DataNotFoundException("Post not found");
        }

        boolean canAccessAllStatuses = post.getAuthor().equals(actor) || authorities.contains(RoleEnum.ADMIN.name());
        var statusToQuery = canAccessAllStatuses ? status : PostStatus.APPROVED;
        var postVersions = postVersionRepository.findByPostIdAndStatusOrderByVersionNumberDesc(postId, statusToQuery.name());
        return postVersions.stream()
                .map(postMapper::projectionToRes)
                .toList();
    }

    @Override
    public PostResponse getPostDetail(String actor, UUID postId) {
        var post = postRepository.getPostDetailById(postId)
                .orElseThrow(() -> {
                    log.warn("Post {} not found for detail view by actor {}", postId, actor);
                    return new DataNotFoundException("Post not found");
                });

        var detailResponse = postMapper.projectionToRes(post);
        detailResponse.setIsMine(post.getAuthorUsername().equals(actor));
        return detailResponse;
    }

    @Override
    @Transactional
    public PostVersionResponse create(String author, PostRequest postRequest) {
        var post = PostEntity.builder()
                .author(author)
                .currentVersionId(null) // Will be set after creating the first version
                .build();
        postRepository.save(post);

        var thumbUrl = validateAndGetThumbUrl(postRequest.getThumbObjectKey(), author);

        var postVersion = postVersionMapper.reqToEntity(postRequest);
        postVersion.setPostId(post.getId());
        postVersion.setThumbUrl(thumbUrl);
        postVersionRepository.save(postVersion);

        return postVersionMapper.entityToRes(postVersion);
    }

    @Override
    @Transactional
    public PostVersionResponse update(String author, PostRequest postRequest) {
        var post = getPostById(postRequest.getPostId());
        if (post == null) {
            log.warn("Post {} not found for author {}", postRequest.getPostId(), author);
            throw new DataNotFoundException("Post not found");
        }

        if (post.getDeletedAt() != null) {
            log.warn("Post {} is deleted, cannot update for author {}", postRequest.getPostId(), author);
            throw new DataNotFoundException("Post not found");
        }

        if (!post.getAuthor().equals(author)) {
            log.warn("Author {} is not the owner of post {}, cannot update", author, postRequest.getPostId());
            throw new DataNotFoundException("Post not found");
        }

        if (!postVersionRepository.existsByPostIdAndStatusIn(post.getId(), List.of(PostStatus.APPROVED))) {
            log.warn("No pending or approved version found for post {}, cannot update for author {}", postRequest.getPostId(), author);
            throw new DataNotFoundException("Cannot update this post");
        }

        var thumbUrl = validateAndGetThumbUrl(postRequest.getThumbObjectKey(), author);

        var postVersion = postVersionMapper.reqToEntity(postRequest);
        postVersion.setPostId(post.getId());
        postVersion.setThumbUrl(thumbUrl);

        var nextVersion = postVersionRepository.getNextVersionNumberByPostId(post.getId());
        postVersion.setVersionNumber(nextVersion);

        postVersionRepository.save(postVersion);

        return postVersionMapper.entityToRes(postVersion);
    }

    @Override
    @Transactional
    public void deletePostVersion(Set<String> authorities, String author, UUID postVersionId) {
        if (!authorities.contains(RoleEnum.ADMIN.name()) && !postVersionRepository.isOwnerOfPostVersion(author, postVersionId)) {
            log.warn("Author {} is not the owner of post version {}, cannot delete", author, postVersionId);
            throw new DataNotFoundException("Post version not found");
        }

        var invalidThumbnailObjectKeys = postVersionRepository.
                deleteByIdAndStatusThenReturnObjectKeys(postVersionId, List.of(PostStatus.PENDING.name(), PostStatus.REJECTED.name(), PostStatus.SUPERSEDED.name()));
        if (invalidThumbnailObjectKeys.isEmpty()) {
            log.warn("Post version {} not found or not in pending status, cannot delete for author {}", postVersionId, author);
            return;
        }

        TransactionUtils.runAfterCommitAsync(() -> {
            var trackingEvent = TrackingEvent.builder()
                    .aggregateId(postVersionId)
                    .action(EventTrackingConstant.POST_VERSION_DELETED)
                    .username(author)
                    .details(String.format("Deleted post version %s", postVersionId))
                    .build();
            KafkaUtils.sendTrackingEvent(trackingEvent);

            for (String key : invalidThumbnailObjectKeys) {
                KafkaUtils.sendDeleteFileEvent(key);
            }
        }, executor);
    }

    @Override
    @Transactional
    public void deletePost(Set<String> authorities, String author, UUID postId) {
        var post = getPostById(postId);
        if (post == null) {
            log.warn("Post {} not found", postId);
            return;
        }

        if (!post.getAuthor().equals(author) && !authorities.contains(RoleEnum.ADMIN.name())) {
            log.error("Author {} is not the owner of post {}, cannot delete", author, postId);
            throw new DataNotFoundException("Post not found");
        }

        if (post.getDeletedAt() != null) {
            log.warn("Post {} is already deleted", postId);
            return;
        }

        post.setDeletedAt(LocalDateTime.now());
        postRepository.save(post);

        // Invalidate cache
        RedisUtils.invalidateCache(RedisPrefixConstant.POST_PREFIX + postId);

        TransactionUtils.runAfterCommitAsync(() -> {
            var trackingEvent = TrackingEvent.builder()
                    .aggregateId(postId)
                    .action(EventTrackingConstant.POST_DELETED)
                    .username(author)
                    .details(String.format("Deleted post %s", postId))
                    .build();
            KafkaUtils.sendTrackingEvent(trackingEvent);

            KafkaUtils.sendSyncPostDeleteEvent(postId);
        }, executor);
    }

    @Override
    @Transactional
    public UpdatePostVersionResult updatePostVersion(String actor, PostStatus postStatus, UUID postVersionId) {
        if (postStatus == PostStatus.PENDING || postStatus == PostStatus.SUPERSEDED) {
            log.warn("Invalid post status {} for updating post version {}", postStatus, postVersionId);
            throw new BadRequestException("Invalid post status for updating post version");
        }

        var postVersion = postVersionRepository.findById(postVersionId)
                .orElseThrow(() -> new DataNotFoundException("Post version not found"));
        if (postVersion.getStatus() != PostStatus.PENDING) {
            log.warn("Post version {} is not in pending status, cannot update to {}", postVersionId, postStatus);
            throw new BadRequestException("Post version is not in pending status, cannot update");
        }

        var post = getPostById(postVersion.getPostId());
        if (post == null) {
            log.warn("Post {} not found for post version {}", postVersion.getPostId(), postVersionId);
            throw new DataNotFoundException("Post not found for post version");
        }

        // Update older version to SUPERSEDED
        var supersededVersions = postVersionRepository.supersededOldVersionByPostId(post.getId(), postVersion.getVersionNumber());

        if (post.getDeletedAt() != null) {
            log.warn("Post {} is deleted, cannot update post version {}", post.getId(), postVersionId);
            throw new BadRequestException("Post is deleted, cannot update post version");
        }

        postVersion.setStatus(postStatus);
        postVersion.setUpdatedAt(LocalDateTime.now());
        postVersionRepository.save(postVersion);

        if (postStatus == PostStatus.APPROVED) {
            post.setCurrentVersionId(postVersion.getId());
            post.setUpdatedAt(LocalDateTime.now());
            postRepository.save(post);

            // Invalidate cache
            RedisUtils.invalidateCache(RedisPrefixConstant.POST_PREFIX + post.getId());
        }

        TransactionUtils.runAfterCommitAsync(() -> {
            var trackingEvent = TrackingEvent.builder()
                    .aggregateId(postVersion.getId())
                    .action(EventTrackingConstant.POST_STATUS_UPDATED)
                    .username(actor)
                    .details(String.format("Updated post version %s to status %s", postVersionId, postStatus))
                    .build();
            KafkaUtils.sendTrackingEvent(trackingEvent);

            supersededVersions.forEach(
                    v -> KafkaUtils.sendDeleteFileEvent(v.getThumbnailObjectKey())
            );

            if (postStatus == PostStatus.REJECTED) {
                KafkaUtils.sendDeleteFileEvent(postVersion.getThumbObjectKey());
            }

            if (postStatus == PostStatus.APPROVED) {
                KafkaUtils.sendSyncPostEvent(postVersion, post.getAuthor());
            }
        }, executor);

        return new UpdatePostVersionResult(
                supersededVersions.stream().map(SupersededVersionProjection::getId).toList(),
                postStatus,
                post.getCurrentVersionId()
        );
    }

    @Override
    public PostEntity getPostById(UUID postId) {
        return RedisUtils.getOptionalDataFromCacheOrDb(
                RedisPrefixConstant.POST_PREFIX + postId,
                PostEntity.class,
                () -> postRepository.findById(postId),
                RedisDurationConstant.POST_DATA_DURATION
        );
    }

    private String validateAndGetThumbUrl(String objectKey, String author) {
        var fileInfo = fileService.getFileInfo(author, objectKey);
        if (fileInfo == null) {
            log.warn("File with object key {} not found for author {}", objectKey, author);
            throw new DataNotFoundException("File not found for thumbnail");
        }

        var thumbUrl = fileInfo.getPublicUrl();
        if (!StringUtils.hasText(thumbUrl)) {
            log.warn("Thumbnail URL is empty for file with object key {} and author {}", objectKey, author);
            throw new BadRequestException("Thumbnail URL is empty");
        }

        return thumbUrl;
    }
}
