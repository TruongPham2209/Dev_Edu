package com.pht.dev_edu.forum.repo;

import com.pht.dev_edu.forum.dto.CommentProjection;
import com.pht.dev_edu.forum.entity.CommentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<CommentEntity, UUID> {
    @Query(value = """
            WITH validComments AS (
                SELECT  c.id            AS id,
                        c.author        AS author,
                        c.content       AS content,
                        c.created_at    AS createdAt,
                        c.deleted_at    AS deletedAt
                FROM forum_comment c
                WHERE   c.post_id               = :postId
                AND     c.deleted_at            IS NULL
                AND     c.root_comment_id       IS NULL
            
                UNION ALL
            
                SELECT  c.id            AS id,
                        c.author        AS author,
                        c.content       AS content,
                        c.created_at    AS createdAt,
                        c.deleted_at    AS deletedAt
                FROM forum_comment c
                WHERE   c.post_id           = :postId
                AND     c.deleted_at        IS NOT NULL
                AND     c.root_comment_id   IS NULL
                AND EXISTS (
                    SELECT 1
                    FROM forum_comment fc
                    WHERE   fc.root_comment_id  = c.id
                    AND     fc.deleted_at       IS NULL
                )
            ),
            replyCounts AS (
                SELECT  fc.root_comment_id  AS commentId,
                        COUNT(*)            AS replyCount
                FROM forum_comment fc
                WHERE   fc.post_id           = :postId
                AND     fc.deleted_at        IS NULL
                GROUP BY fc.root_comment_id
            )
            SELECT  vc.id                           AS id,
                    vc.author                       AS authorUsername,
                    u.full_name                     AS authorFullName,
                    u.avatar_url                    AS authorAvatarUrl,
                    vc.content                      AS content,
                    NULL                            AS repliedToCommentId,
                    vc.createdAt                    AS createdAt,
                    rc.replyCount                   AS replyCount,
                    (vc.deletedAt IS NOT NULL)      AS isDeleted
            FROM validComments vc
            LEFT JOIN replyCounts rc
                ON rc.commentId = vc.id
            INNER JOIN "user" u
                ON  u.username = vc.author
            WHERE (vc.createdAt, vc.id) < (:lastCreatedAt, :lastId)
            ORDER BY vc.createdAt DESC, vc.id DESC
            """, countQuery = """
            WITH validComments AS (
                SELECT  c.id            AS id,
                        c.author        AS author,
                        c.content       AS content,
                        c.created_at    AS createdAt,
                        c.deleted_at    AS deletedAt
                FROM forum_comment c
                WHERE   c.post_id               = :postId
                AND     c.deleted_at            IS NULL
                AND     c.root_comment_id       IS NULL
            
                UNION ALL
            
                SELECT  c.id            AS id,
                        c.author        AS author,
                        c.content       AS content,
                        c.created_at    AS createdAt,
                        c.deleted_at    AS deletedAt
                FROM forum_comment c
                WHERE   c.post_id           = :postId
                AND     c.deleted_at        IS NOT NULL
                AND     c.root_comment_id   IS NULL
                AND EXISTS (
                    SELECT 1
                    FROM forum_comment fc
                    WHERE   fc.root_comment_id  = c.id
                    AND     fc.deleted_at       IS NULL
                )
            )
            SELECT COUNT(vc.id)
            FROM validComments vc
            """, nativeQuery = true)
    Page<CommentProjection> findRootCommentsByPostIdAndCursor(UUID postId, UUID lastId, LocalDateTime lastCreatedAt, Pageable pageable);

    @Query(value = """
            SELECT  fc.id                       AS id,
                    fc.author                   AS authorUsername,
                    u.full_name                 AS authorFullName,
                    u.avatar_url                AS authorAvatarUrl,
                    fc.content                  AS content,
                    fc.root_comment_id          AS repliedToCommentId,
                    fc.created_at               AS createdAt,
                    0                           AS replyCount,
                    FALSE                       AS isDeleted
            FROM forum_comment fc
            INNER JOIN "user" u
                ON  u.username = fc.author
            WHERE   fc.root_comment_id      = :rootCommentId
            AND     (fc.created_at, fc.id)  < (:lastCreatedAt, :lastId)
            AND     fc.deleted_at           IS NULL
            ORDER BY fc.created_at DESC, fc.id DESC
            """, countQuery = """
            SELECT  COUNT(id)
            FROM forum_comment
            WHERE   root_comment_id = :rootCommentId
            AND     deleted_at      IS NULL
            """, nativeQuery = true)
    Page<CommentProjection> findReplyCommentsByRootCommentIdAndCursor(UUID rootCommentId, UUID lastId, LocalDateTime lastCreatedAt, Pageable pageable);

    int deleteByDeletedAtIsBefore(LocalDateTime cutoffTime);

    @Modifying
    @Query(value = """
            DELETE FROM forum_comment fc
            WHERE NOT EXISTS (
                SELECT 1
                FROM forum_post fp
                WHERE fp.id = fc.post_id
            )
            RETURNING fc.id
            """, nativeQuery = true)
    List<UUID> deleteCommentWithoutPostReference();

    boolean existsByRootCommentIdAndDeletedAtIsNull(UUID rootCommentId);
}
