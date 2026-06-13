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
                            WHERE   lecture_id          = :lectureId
                            AND     deleted_at          IS NULL
                            AND     depth               = 0
                            AND     (created_at, id)    < (:lastCreatedAt, :lastCommentId)
            
                            UNION ALL
            
                            SELECT  c.id                AS id,
                                    c.content           AS content,
                                    c.created_at        AS createdAt,
                                    c.deleted_at        AS deletedAt,
                                    c.root_comment_id   AS rootCommentId,
                                    c.parent_comment_id AS parentCommentId,
                                    c.username          AS author
                            FROM lecture_comment c
                            WHERE   lecture_id          = :lectureId
                            AND     deleted_at          IS NOT NULL
                            AND     depth               = 0
                            AND     (created_at, id)    < (:lastCreatedAt, :lastCommentId)
                            AND     EXISTS(
                                SELECT 1
                                FROM lecture_comment AS lc
                                WHERE   lc.root_comment_id  = c.id
                                AND     lc.deleted_at       IS NULL
                            )
                        ),
                        replyCounts AS (
                            SELECT  lc.root_comment_id      AS id,
                                    COUNT(*)                AS replyCount
                            FROM lecture_comment lc
                            WHERE   lc.lecture_id   = :lectureId
                            AND     lc.deleted_at   IS NULL
                            GROUP BY lc.root_comment_id
                        )
                        SELECT      vc.id                           AS id,
                                    vc.content                      AS content,
                                    vc.createdAt                    AS createdAt,
                                    CASE WHEN vc.deletedAt IS NOT NULL THEN true
                                    ELSE false END                  AS isDeleted,
                                    u.username                      AS authorUsername,
                                    u.full_name                     AS authorFullName,
                                    u.avatar_url                    AS authorAvatarUrl,
                                    COALESCE(rc.replyCount, 0)      AS replyCount
                        FROM validComments vc
                        LEFT JOIN replyCounts rc
                            ON vc.id = rc.id
                        LEFT JOIN "user" u
                            ON u.username = vc.author
                        ORDER BY vc.createdAt DESC, vc.id DESC
            """, countQuery = """
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
                            AND     deleted_at  IS NULL
                            AND     depth       = 0
            
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
                            AND     deleted_at  IS NOT NULL
                            AND     depth       = 0
                            AND     EXISTS(
                                SELECT 1
                                FROM lecture_comment lc
                                WHERE   lc.root_comment_id  = c.id
                                AND     lc.deleted_at       IS NULL
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
                            WHERE   parent_comment_id   = :parentCommentId
                            AND     deleted_at IS NULL
                            AND     depth               = 1
                            AND     (created_at, id)    < (:lastCreatedAt, :lastCommentId)
            
                            UNION ALL
            
                            SELECT  c.id                AS id,
                                    c.content           AS content,
                                    c.created_at        AS createdAt,
                                    c.deleted_at        AS deletedAt,
                                    c.root_comment_id   AS rootCommentId,
                                    c.parent_comment_id AS parentCommentId,
                                    c.username          AS author
                            FROM lecture_comment c
                            WHERE   parent_comment_id   = :parentCommentId
                            AND     deleted_at          IS NOT NULL
                            AND     depth               = 1
                            AND     (created_at, id)    < (:lastCreatedAt, :lastCommentId)
                            AND     EXISTS(
                                SELECT 1
                                FROM lecture_comment AS lc
                                WHERE   lc.parent_comment_id    = c.id
                                AND     lc.deleted_at           IS NULL
                            )
                        ),
                        replyCounts AS (
                            SELECT  lc.parent_comment_id    AS id,
                                    COUNT(*)                AS replyCount
                            FROM lecture_comment lc
                            WHERE   lc.parent_comment_id    = :parentCommentId
                            AND     lc.deleted_at           IS NULL
                            GROUP BY lc.parent_comment_id
                        )
                        SELECT      vc.id                           AS id,
                                    vc.content                      AS content,
                                    vc.createdAt                    AS createdAt,
                                    CASE WHEN vc.deletedAt IS NOT NULL THEN true
                                    ELSE false END                  AS isDeleted,
                                    vc.rootCommentId                AS rootCommentId,
                                    vc.parentCommentId              AS parentCommentId,
                                    u.username                      AS authorUsername,
                                    u.full_name                     AS authorFullName,
                                    u.avatar_url                    AS authorAvatarUrl,
                                    COALESCE(rc.replyCount, 0)      AS replyCount
                        FROM validComments vc
                        LEFT JOIN replyCounts rc
                            ON vc.id = rc.id
                        LEFT JOIN "user" u
                            ON u.username = vc.author
                        ORDER BY vc.createdAt DESC, vc.id DESC
            """, countQuery = """
                        WITH validComments AS (
                            SELECT  c.id                AS id,
                                    c.content           AS content,
                                    c.created_at        AS createdAt,
                                    c.deleted_at        AS deletedAt,
                                    c.root_comment_id   AS rootCommentId,
                                    c.parent_comment_id AS parentCommentId,
                                    c.username          AS author
                            FROM lecture_comment c
                            WHERE   parent_comment_id   = :parentCommentId
                            AND     deleted_at          IS NULL
                            AND     depth               = 1
            
                            UNION ALL
            
                            SELECT  c.id                AS id,
                                    c.content           AS content,
                                    c.created_at        AS createdAt,
                                    c.deleted_at        AS deletedAt,
                                    c.root_comment_id   AS rootCommentId,
                                    c.parent_comment_id AS parentCommentId,
                                    c.username          AS author
                            FROM lecture_comment c
                            WHERE   parent_comment_id   = :parentCommentId
                            AND     deleted_at          IS NOT NULL
                            AND     depth               = 1
                            AND     EXISTS(
                                SELECT 1
                                FROM lecture_comment lc
                                WHERE   lc.parent_comment_id    = c.id
                                AND     lc.deleted_at           IS NULL
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
                                    lc.root_comment_id      AS rootCommentId,
                                    lc.parent_comment_id    AS parentCommentId,
                                    lc.created_at           AS createdAt,
                                    lc.username             AS authorUsername,
                                    u.full_name             AS authorFullName,
                                    u.avatar_url            AS authorAvatarUrl,
                                    false                   AS isDeleted,
                                    0                       AS replyCount
                        FROM  lecture_comment lc
                        INNER JOIN "user" u
                            ON lc.username = u.username
                        WHERE   lc.parent_comment_id    = :parentCommentId
                        AND     lc.deleted_at           IS NULL
                        AND     lc.depth                = 2
                        AND     (lc.created_at, lc.id)  < (:lastCreatedAt, :lastCommentId)
                        ORDER BY lc.created_at DESC, lc.id DESC
            """, countQuery = """
                        SELECT    COUNT(*)
                        FROM  lecture_comment lc
                        WHERE   lc.parent_comment_id    = :parentCommentId
                        AND     lc.deleted_at           IS NULL
                        AND     lc.depth                = 2
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
    int deleteByDeletedAtBefore(LocalDateTime cutoffTime);

    @Modifying
    void deleteByLectureId(UUID lectureId);
}
