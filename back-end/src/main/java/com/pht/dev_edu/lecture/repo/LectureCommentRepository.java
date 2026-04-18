package com.pht.dev_edu.lecture.repo;

import com.pht.dev_edu.lecture.dto.CommentProjection;
import com.pht.dev_edu.lecture.entity.LectureCommentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.UUID;

public interface LectureCommentRepository extends JpaRepository<LectureCommentEntity, UUID> {
    @Query(value = """
                        WITH validComments AS (
                            SELECT  c.id                AS id,
                                    c.content           AS content,
                                    c.created_at        AS createdAt,
                                    c.deleted_at        AS deletedAt,
                                    c.root_comment_id   AS rootCommentId,
                                    c.parent_comment_id AS parentCommentId,
                                    c.username          AS author
                            FROM lecture_comment c
                            WHERE   lecture_id  = :lectureId
                            AND     deleted_at IS NULL
                            AND     depth       = 0
                            AND     (created_at, id) < (lastCreatedAt, :lastId)
                            
                            UNION ALL
                            
                            SELECT  c.id                AS id,
                                    c.content           AS content,
                                    c.created_at        AS createdAt,
                                    c.deleted_at        AS deletedAt,
                                    c.root_comment_id   AS rootCommentId,
                                    c.parent_comment_id AS parentCommentId,
                                    c.username          AS author
                            FROM lecture_comment c
                            WHERE   lecture_id  = :lectureId
                            AND     deleted_at IS NOT NULL
                            AND     depth       = 0
                            AND     (created_at, id) < (lastCreatedAt, :lastId)
                            AND     EXISTS(
                                SELECT 1
                                FROM lecture_comment AS lc
                                WHERE   lc.root_comment_id = c.id
                                AND     lc.deleted_at IS NULL
                            )
                        )
                        SELECT      vc.id                   AS id,
                                    vc.content              AS content,
                                    vc.createdAt            AS createdAt,
                                    CASE WHEN vc.deletedAt IS NOT NULL THEN true 
                                    ELSE false END          AS isDeleted,
                                    vc.author               AS author,
                                    COUNT(lc.id)            AS replyCount
                        FROM validComments vc
                        LEFT JOIN lecture_comment lc
                            ON vc.id = lc.parent_comment_id
                        GROUP BY vc.id
            """, countQuery = """
                        WITH validComments AS (
                            SELECT  c.id                AS id,
                                    c.content           AS content,
                                    c.created_at        AS createdAt,
                                    c.deleted_at        AS deletedAt,
                                    c.root_comment_id   AS rootCommentId,
                                    c.parent_comment_id AS parentCommentId,
                                    c.username          AS author
                            FROM lecture_comment
                            WHERE   lecture_id  = :lectureId
                            AND     deleted_at IS NULL
                            AND     depth       = 0
                            
                            UNION ALL
                            
                            SELECT  c.id                AS id,
                                    c.content           AS content,
                                    c.created_at        AS createdAt,
                                    c.deleted_at        AS deletedAt,
                                    c.root_comment_id   AS rootCommentId,
                                    c.parent_comment_id AS parentCommentId,
                                    c.username          AS author
                            WHERE   lecture_id  = :lectureId
                            AND     deleted_at IS NOT NULL
                            AND     depth       = 0
                            AND     EXISTS(
                                SELECT 1
                                FROM lecture_comment AS lc
                                WHERE   lc.root_comment_id = c.id
                                AND     lc.deleted_at IS NULL
                            )
                        )
                        SELECT    COUNT(*)
                        FROM validComments
            """
            , nativeQuery = true)
    Page<CommentProjection> findRootCommentsByLectureId(UUID lectureId, UUID lastCommentId, LocalDateTime lastCreatedAt, org.springframework.data.domain.Pageable pageable);

    @Query(value = """
                        WITH validComments AS (
                            SELECT  c.id                AS id,
                                    c.content           AS content,
                                    c.created_at        AS createdAt,
                                    c.deleted_at        AS deletedAt,
                                    c.root_comment_id   AS rootCommentId,
                                    c.parent_comment_id AS parentCommentId,
                                    c.username          AS author
                            FROM lecture_comment c
                            WHERE   parent_comment_id   = :parent_comment_id
                            AND     deleted_at IS NULL
                            AND     depth               = 1
                            AND     (created_at, id)    < (:lastCreatedAt, :lastId)
                            
                            UNION ALL
                            
                            SELECT  c.id                AS id,
                                    c.content           AS content,
                                    c.created_at        AS createdAt,
                                    c.deleted_at        AS deletedAt,
                                    c.root_comment_id   AS rootCommentId,
                                    c.parent_comment_id AS parentCommentId,
                                    c.username          AS author
                            FROM lecture_comment c
                            WHERE   parent_comment_id   = :parent_comment_id
                            AND     deleted_at IS NOT NULL
                            AND     depth               = 1
                            AND     (created_at, id)    < (:lastCreatedAt, :lastId)
                            AND     EXISTS(
                                SELECT 1
                                FROM lecture_comment AS lc
                                WHERE   lc.parent_comment_id = c.id
                                AND     lc.deleted_at IS NULL
                            )
                        )
                        SELECT      vc.id                   AS id,
                                    vc.content              AS content,
                                    vc.createdAt            AS createdAt,
                                    CASE WHEN vc.deletedAt IS NOT NULL THEN true 
                                    ELSE false END          AS isDeleted,
                                    vc.author               AS author,
                                    COUNT(lc.id)            AS replyCount
                        FROM validComments vc
                        LEFT JOIN lecture_comment lc
                            ON vc.id = lc.parent_comment_id
                        GROUP BY vc.id
            """, countQuery = """
                        WITH validComments AS (
                            SELECT  c.id                AS id,
                                    c.content           AS content,
                                    c.created_at        AS createdAt,
                                    c.deleted_at        AS deletedAt,
                                    c.root_comment_id   AS rootCommentId,
                                    c.parent_comment_id AS parentCommentId,
                                    c.username          AS author
                            FROM lecture_comment
                            WHERE   parent_comment_id   = :parent_comment_id
                            AND     deleted_at IS NULL
                            AND     depth               = 1
                            
                            UNION ALL
                            
                            SELECT  c.id                AS id,
                                    c.content           AS content,
                                    c.created_at        AS createdAt,
                                    c.deleted_at        AS deletedAt,
                                    c.root_comment_id   AS rootCommentId,
                                    c.parent_comment_id AS parentCommentId,
                                    c.username          AS author
                            WHERE   parent_comment_id   = :parent_comment_id
                            AND     deleted_at IS NOT NULL
                            AND     depth               = 1
                            AND     EXISTS(
                                SELECT 1
                                FROM lecture_comment AS lc
                                WHERE   lc.parent_comment_id = c.id
                                AND     lc.deleted_at IS NULL
                            )
                        )
                        SELECT    COUNT(*)
                        FROM validComments
            """
            , nativeQuery = true)
    Page<CommentProjection> findFirstLevelRepliesByParentCommentId(UUID parentCommentId, UUID lastCommentId, LocalDateTime lastCreatedAt, org.springframework.data.domain.Pageable pageable);

    @Query(value = """
                        SELECT      lc.id                   AS id,
                                    lc.content              AS content,
                                    lc.createdAt            AS createdAt,
                                    lc.author               AS author,
                                    false                   AS isDeleted,
                                    0                       AS replyCount
                        FROM  lecture_comment lc
                        WHERE   lc.parent_comment_id = :parentCommentId
                        AND     lc.deleted_at IS NULL
                        AND     lc.depth = 2
                        AND     (lc.created_at, lc.id) < (:lastCreatedAt, :lastCommentId)
            """, countQuery = """
                        SELECT    COUNT(*)
                        FROM  lecture_comment lc
                        WHERE   lc.parent_comment_id = :parentCommentId
                        AND     lc.deleted_at IS NULL
                        AND     lc.depth = 2
            """
            , nativeQuery = true)
    Page<CommentProjection> findSecondLevelRepliesByParentCommentId(UUID parentCommentId, UUID lastCommentId, LocalDateTime lastCreatedAt, org.springframework.data.domain.Pageable pageable);

    @Query(value = """
                SELECT
                EXISTS (
                    SELECT 1
                    FROM lecture_comment
                    WHERE parent_comment_id = :commentId
                    AND deleted_at IS NULL
                )
                OR
                EXISTS (
                    SELECT 1
                    FROM lecture_comment
                    WHERE root_comment_id = :commentId
                    AND deleted_at IS NULL
                )
            """, nativeQuery = true)
    boolean hasNonDeletedReplies(UUID commentId);

    @Modifying
    @Query("DELETE FROM LectureCommentEntity lc WHERE lc.deletedAt < :cutoffTime AND lc.depth = 2")
    long deleteByDeletedAtBefore(LocalDateTime cutoffTime);
}
