package com.pht.dev_edu.lecture.service;

import com.pht.dev_edu.common.constant.RedisDurationConstant;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.RedisUtil;
import com.pht.dev_edu.lecture.dto.CommentRequest;
import com.pht.dev_edu.lecture.dto.CommentResponse;
import com.pht.dev_edu.lecture.entity.LectureCommentEntity;
import com.pht.dev_edu.lecture.mapper.LectureCommentMapper;
import com.pht.dev_edu.lecture.repo.LectureCommentRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service("lectureCommentService")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CommentServiceImpl implements CommentService {
    LectureCommentRepository lectureCommentRepository;
    LectureCommentMapper commentMapper;
    LecturePermissionService lecturePermissionService;

    private static final int MAX_COMMENT_DEPTH = 2; // Count start from 0, so 0: root, 1: reply to root, 2: reply to reply

    @Override
    public CustomPaging<CommentResponse> getComments(Set<String> authorities, String actor, UUID lectureId, int page, int size) {
        return null;
    }

    @Override
    public CustomPaging<CommentResponse> getCommentsByParent(Set<String> authorities, String actor, UUID lectureId, UUID parentCommentId, int page, int size) {
        return null;
    }

    @Override
    @Transactional
    public CommentResponse create(Set<String> authorities, String author, CommentRequest req) {
        lecturePermissionService.checkViewPermissionByLecture(authorities, author, req.getLectureId());

        var commentEntity = commentMapper.reqToEntity(req);
        commentEntity.setUsername(author);
        if (req.getParentCommentId() != null) {
            var parentComment = findCommentById(req.getParentCommentId());
            if (parentComment == null) {
                log.error("Parent comment with id {} not found", req.getParentCommentId());
                throw new DataNotFoundException("Parent comment not found");
            }

            if (parentComment.getDepth() == MAX_COMMENT_DEPTH && parentComment.getDeletedAt() != null) {
                log.warn("Parent comment with id {} is deleted and has reached max depth, cannot add reply", req.getParentCommentId());
                throw new BadRequestException("Cannot add reply to a deleted comment that has reached max depth");
            }

            int newCommentDepth = Math.min(parentComment.getDepth() + 1, MAX_COMMENT_DEPTH);
            UUID rootCommentId = parentComment.getRootCommentId() != null ? parentComment.getRootCommentId() : parentComment.getId();
            UUID parentCommentId = parentComment.getDepth() == MAX_COMMENT_DEPTH ? parentComment.getParentCommentId() : parentComment.getId();

            commentEntity.setDepth(newCommentDepth);
            commentEntity.setRootCommentId(rootCommentId);
            commentEntity.setParentCommentId(parentCommentId);
        }
        lectureCommentRepository.save(commentEntity);
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

        // Send tracking event

        RedisUtil.invalidateCache(RedisPrefixConstant.LECTURE_COMMENT_PREFIX + commentId);
    }

    private LectureCommentEntity findCommentById(UUID commentId) {
        return RedisUtil.getDataFromCacheOrDb(
                RedisPrefixConstant.LECTURE_COMMENT_PREFIX + commentId,
                LectureCommentEntity.class,
                () -> lectureCommentRepository.findById(commentId),
                RedisDurationConstant.LECTURE_COMMENT_DATA_DURATION
        );
    }
}
