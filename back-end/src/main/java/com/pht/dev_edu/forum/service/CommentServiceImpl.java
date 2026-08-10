package com.pht.dev_edu.forum.service;

import com.pht.dev_edu.common.constant.EventTrackingConstant;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.dto.TimeStampCursor;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.common.util.PagingUtils;
import com.pht.dev_edu.common.util.TransactionUtils;
import com.pht.dev_edu.forum.dto.CommentProjection;
import com.pht.dev_edu.forum.dto.CommentRequest;
import com.pht.dev_edu.forum.dto.CommentResponse;
import com.pht.dev_edu.forum.entity.CommentEntity;
import com.pht.dev_edu.forum.mapper.ForumCommentMapper;
import com.pht.dev_edu.forum.repo.CommentRepository;
import com.pht.dev_edu.notification.dto.NotificationEvent;
import com.pht.dev_edu.notification.dto.NotificationTargetType;
import com.pht.dev_edu.notification.dto.PersonalNotificationEvent;
import com.pht.dev_edu.notification.service.NotificationPersonalService;
import com.pht.dev_edu.tracking.dto.TrackingEvent;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Executor;

@Slf4j
@Service("forumCommentService")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommentServiceImpl implements CommentService {
    CommentRepository commentRepository;

    NotificationPersonalService notificationPersonalService;
    ForumCommentMapper forumCommentMapper;
    Executor executor;

    private static final int MAX_COMMENT_DEPTH = 1;

    @Override
    @Transactional
    public CommentResponse createComment(String username, CommentRequest request) {
        var commentEntity = forumCommentMapper.reqToEntity(request);
        commentEntity.setAuthor(username);

        CommentEntity parentComment;

        if (request.getRepliedToCommentId() != null) {
            parentComment = commentRepository.findById(request.getRepliedToCommentId())
                    .orElseThrow(() -> {
                        log.error("Parent comment not found with ID {}", request.getRepliedToCommentId());
                        return new BadRequestException("Parent comment not found.");
                    });

            if (!parentComment.getPostId().equals(request.getPostId())) {
                log.error("Parent comment's post ID {} does not match request post ID {}", parentComment.getPostId(), request.getPostId());
                throw new BadRequestException("Parent comment does not belong to the same post.");
            }

            if (parentComment.getDeletedAt() != null && !commentRepository.existsByRootCommentIdAndDeletedAtIsNull(parentComment.getId())) {
                log.error("Cannot reply to deleted comment with ID {}", parentComment.getId());
                throw new BadRequestException("Parent comment not found.");
            }

            commentEntity.setRepliedToCommentId(request.getRepliedToCommentId());
            commentEntity.setRootCommentId(parentComment.getRootCommentId() != null ? parentComment.getRootCommentId() : parentComment.getId());

            int depth = Math.min(parentComment.getDepth() + 1, MAX_COMMENT_DEPTH);
            commentEntity.setDepth(depth);
        } else {
            parentComment = null;
        }

        commentRepository.save(commentEntity);
        TransactionUtils.runAfterCommitAsync(() -> {
            Map<NotificationTargetType, String> targetData = new HashMap<>();
            targetData.put(NotificationTargetType.POST, commentEntity.getPostId().toString());
            PersonalNotificationEvent event = PersonalNotificationEvent.builder()
                    .event(NotificationEvent.POST_COMMENT)
                    .targetData(targetData)
                    .content(commentEntity.getContent())
                    .build();
            notificationPersonalService.publishNotification(event);

            if (parentComment != null) {
                PersonalNotificationEvent responseEvent = PersonalNotificationEvent.builder()
                        .event(NotificationEvent.POST_RESPONSE)
                        .targetData(targetData)
                        .username(parentComment.getAuthor())
                        .content(commentEntity.getContent())
                        .build();
                notificationPersonalService.publishNotification(responseEvent);
            }
        }, executor);
        return forumCommentMapper.entityToRes(commentEntity);
    }

    @Override
    public CustomPaging<CommentResponse> getCommentsByPostId(String username, UUID postId, String nextCursor) {
        var cursor = resolveCursor(nextCursor);
        var pageable = PageRequest.of(0, 11);

        var commentPage = commentRepository.findRootCommentsByPostIdAndCursor(
                postId,
                cursor.getId(),
                cursor.getTimeStamp(),
                pageable
        );

        return PagingUtils.getPagedWithCursor(
                commentPage,
                c -> convertProjectionToRes(c, username),
                CommentProjection::getCreatedAt,
                CommentProjection::getId,
                pageable.getPageSize() - 1
        );
    }

    @Override
    public CustomPaging<CommentResponse> getRepliedComments(String username, UUID parentCommentId, String nextCursor) {
        var cursor = resolveCursor(nextCursor);
        var pageable = PageRequest.of(0, 11);

        var commentPage = commentRepository.findReplyCommentsByRootCommentIdAndCursor(
                parentCommentId,
                cursor.getId(),
                cursor.getTimeStamp(),
                pageable
        );

        return PagingUtils.getPagedWithCursor(
                commentPage,
                c -> convertProjectionToRes(c, username),
                CommentProjection::getCreatedAt,
                CommentProjection::getId,
                pageable.getPageSize() - 1
        );
    }

    @Override
    @Transactional
    public void deleteComment(Set<String> authorities, String username, UUID commentId) {
        var comment = commentRepository.findById(commentId).orElse(null);
        if (comment == null || comment.getDeletedAt() != null) {
            log.error("Comment with ID {} not found or already deleted.", commentId);
            return;
        }

        if (!comment.getAuthor().equals(username) && !authorities.contains(RoleEnum.ADMIN.name())) {
            log.error("User {} does not have permission to delete comment with ID {}.", username, commentId);
            throw new BadRequestException("You do not have permission to delete this comment.");
        }

        comment.setDeletedAt(LocalDateTime.now());
        commentRepository.save(comment);

        TransactionUtils.runAfterCommitAsync(() -> {
            var trackingEvent = TrackingEvent.builder()
                    .aggregateId(commentId)
                    .action(EventTrackingConstant.FORUM_COMMENT_DELETED)
                    .username(username)
                    .details(String.format("Deleted comment with ID %s", commentId))
                    .build();
            KafkaUtils.sendTrackingEvent(trackingEvent);
        }, executor);
    }

    private TimeStampCursor resolveCursor(String nextCursor) {
        return StringUtils.hasText(nextCursor)
                ? PagingUtils.decodeTimeStampCursor(nextCursor)
                : TimeStampCursor.getDefaultCursor(true);
    }

    private CommentResponse convertProjectionToRes(CommentProjection projection, String actor) {
        var content = projection.getIsDeleted() ? "This comment has been deleted" : projection.getContent();
        boolean isMine = projection.getAuthorUsername().equals(actor);
        var commentResponse = forumCommentMapper.projectionToRes(projection);
        commentResponse.setContent(content);
        commentResponse.setIsMine(isMine);
        commentResponse.setIsDeleted(projection.getIsDeleted());
        return commentResponse;
    }
}
