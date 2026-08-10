package com.pht.dev_edu.lecture.service;

import com.pht.dev_edu.common.constant.EventTrackingConstant;
import com.pht.dev_edu.common.constant.RedisDurationConstant;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.TimeStampCursor;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.common.util.PagingUtils;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.common.util.TransactionUtils;
import com.pht.dev_edu.lecture.dto.CommentPageRequest;
import com.pht.dev_edu.lecture.dto.CommentProjection;
import com.pht.dev_edu.lecture.dto.CommentRequest;
import com.pht.dev_edu.lecture.dto.CommentResponse;
import com.pht.dev_edu.lecture.entity.LectureCommentEntity;
import com.pht.dev_edu.lecture.mapper.LectureCommentMapper;
import com.pht.dev_edu.lecture.repo.LectureCommentRepository;
import com.pht.dev_edu.notification.dto.NotificationEvent;
import com.pht.dev_edu.notification.dto.NotificationTargetType;
import com.pht.dev_edu.notification.dto.PersonalNotificationEvent;
import com.pht.dev_edu.notification.service.NotificationPersonalService;
import com.pht.dev_edu.tracking.dto.TrackingEvent;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
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
@Service("lectureCommentService")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CommentServiceImpl implements CommentService {
    LectureCommentRepository lectureCommentRepository;
    LectureCommentMapper commentMapper;
    NotificationPersonalService notificationPersonalService;
    LecturePermissionService lecturePermissionService;
    Executor executor;

    private static final int MAX_COMMENT_DEPTH = 2; // Count start from 0, so 0: root, 1: reply to root, 2: reply to reply

    @Override
    public CustomPaging<CommentResponse> getComments(Set<String> authorities, String actor, CommentPageRequest req) {
        // If lastItemId is not provided, use a default value that is greater than any possible comment id to get the first page
        var cursor = StringUtils.hasText(req.getNextCursor()) ? PagingUtils.decodeTimeStampCursor(req.getNextCursor()) : TimeStampCursor.getDefaultCursor(true);
        lecturePermissionService.checkViewPermissionByLecture(authorities, actor, req.getLectureId());

        var pageable = req.toPageable();

        if (req.getParentCommentId() == null) {
            var pageComments = lectureCommentRepository.findRootCommentsByLectureId(
                    req.getLectureId(),
                    cursor.getId(),
                    cursor.getTimeStamp(),
                    pageable
            );
            return PagingUtils.getPagedWithCursor(
                    pageComments,
                    c -> convertProjectionToResponse(c, actor),
                    CommentProjection::getCreatedAt,
                    CommentProjection::getId,
                    pageable.getPageSize() - 1
            );
        }

        var parentComment = findCommentById(req.getParentCommentId());
        if (parentComment == null) {
            log.error("Parent comment with id {} not found", req.getParentCommentId());
            throw new DataNotFoundException("Parent comment not found");
        }

        if (parentComment.getDepth() == MAX_COMMENT_DEPTH) {
            log.error("Parent comment with id {} has reached max depth {}, cannot get replies", req.getParentCommentId(), MAX_COMMENT_DEPTH);
            throw new BadRequestException("Parent comment has reached max depth, cannot get replies");
        }
        var pageComments = switch (parentComment.getDepth()) {
            case 0 -> lectureCommentRepository.findFirstLevelRepliesByParentCommentId(
                    parentComment.getId(),
                    cursor.getId(),
                    cursor.getTimeStamp(),
                    pageable
            );
            case 1 -> lectureCommentRepository.findSecondLevelRepliesByParentCommentId(
                    parentComment.getId(),
                    cursor.getId(),
                    cursor.getTimeStamp(),
                    pageable
            );
            default -> throw new IllegalStateException("Unexpected comment depth: " + parentComment.getDepth());
        };

        return PagingUtils.getPagedWithCursor(
                pageComments,
                c -> convertProjectionToResponse(c, actor),
                CommentProjection::getCreatedAt,
                CommentProjection::getId,
                pageable.getPageSize() - 1
        );
    }

    @Override
    @Transactional
    public CommentResponse create(Set<String> authorities, String author, CommentRequest req) {
        lecturePermissionService.checkViewPermissionByLecture(authorities, author, req.getLectureId());

        var commentEntity = commentMapper.reqToEntity(req);
        commentEntity.setUsername(author);
        commentEntity.setDepth(0);

        LectureCommentEntity parentComment;

        if (req.getParentCommentId() != null) {
            parentComment = findCommentById(req.getParentCommentId());
            if (parentComment == null) {
                log.error("Parent comment with id {} not found", req.getParentCommentId());
                throw new DataNotFoundException("Parent comment not found");
            }

            if (parentComment.getDepth() == MAX_COMMENT_DEPTH && parentComment.getDeletedAt() != null) {
                log.warn("Parent comment with id {} is deleted and has reached max depth, cannot add reply", req.getParentCommentId());
                throw new BadRequestException("Cannot add reply to a deleted comment that has reached max depth");
            }

            if (parentComment.getDeletedAt() != null && !lectureCommentRepository.hasNonDeletedReplies(parentComment.getId())) {
                log.error("Parent comment with id {} is deleted and has no non-deleted replies, cannot add reply", req.getParentCommentId());
                throw new BadRequestException("Cannot add reply to a deleted comment that has no non-deleted replies");
            }

            int newCommentDepth = Math.min(parentComment.getDepth() + 1, MAX_COMMENT_DEPTH);
            UUID rootCommentId = parentComment.getRootCommentId() != null ? parentComment.getRootCommentId() : parentComment.getId();
            UUID parentCommentId = parentComment.getDepth() == MAX_COMMENT_DEPTH ? parentComment.getParentCommentId() : parentComment.getId();

            commentEntity.setDepth(newCommentDepth);
            commentEntity.setRootCommentId(rootCommentId);
            commentEntity.setParentCommentId(parentCommentId);
        } else {
            parentComment = null;
        }
        lectureCommentRepository.save(commentEntity);

        TransactionUtils.runAfterCommitAsync(() -> {
            if (parentComment != null) {
                Map<NotificationTargetType, String> targetData = new HashMap<>();
                targetData.put(NotificationTargetType.LECTURE, commentEntity.getLectureId().toString());
                PersonalNotificationEvent event = PersonalNotificationEvent.builder()
                        .event(NotificationEvent.LECTURE_COMMENT_RESPONSE)
                        .targetData(targetData)
                        .username(parentComment.getUsername())
                        .content(commentEntity.getContent())
                        .build();
                notificationPersonalService.publishNotification(event);
            }
        }, executor);
        return commentMapper.entityToRes(commentEntity);
    }

    @Override
    @Transactional
    public void delete(Set<String> authorities, String actor, UUID commentId) {
        var comment = findCommentById(commentId);
        if (comment == null) {
            log.error("Comment with id {} not found", commentId);
            throw new DataNotFoundException("Comment not found");
        }

        if (comment.getDeletedAt() != null) {
            log.warn("Comment with id {} is already deleted", commentId);
            return; // Idempotent delete
        }

        boolean isAuthor = comment.getUsername().equals(actor);
        if (!isAuthor) {
            lecturePermissionService.checkModifyPermissionByLecture(authorities, actor, comment.getLectureId());
        }

        comment.setDeletedAt(LocalDateTime.now());
        lectureCommentRepository.save(comment);

        TransactionUtils.runAfterCommitAsync(() -> {
            var trackingEvent = TrackingEvent.builder()
                    .action(EventTrackingConstant.COMMENT_DELETED)
                    .username(actor)
                    .details("Deleted comment with id " + commentId)
                    .aggregateId(commentId)
                    .build();
            KafkaUtils.sendTrackingEvent(trackingEvent);
        }, executor);

        RedisUtils.invalidateCache(RedisPrefixConstant.LECTURE_COMMENT_PREFIX + commentId);
    }

    private LectureCommentEntity findCommentById(UUID commentId) {
        return RedisUtils.getOptionalDataFromCacheOrDb(
                RedisPrefixConstant.LECTURE_COMMENT_PREFIX + commentId,
                LectureCommentEntity.class,
                () -> lectureCommentRepository.findById(commentId),
                RedisDurationConstant.LECTURE_COMMENT_DATA_DURATION
        );
    }

    private CommentResponse convertProjectionToResponse(CommentProjection projection, String actor) {
        var content = projection.getIsDeleted() ? "This comment has been deleted" : projection.getContent();
        boolean isMine = projection.getAuthorUsername().equals(actor);
        var commentResponse = commentMapper.projectionToRes(projection);
        commentResponse.setContent(content);
        commentResponse.setIsMine(isMine);
        return commentResponse;
    }
}
