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
            )
            SELECT  vc.id                           AS id,
                    vc.author                       AS author,
                    vc.content                      AS content,
                    NULL                            AS repliedToCommentId,
                    vc.createdAt                    AS createdAt,
                    COUNT(r.id)                     AS replyCount,
                    (vc.deletedAt IS NOT NULL)      AS isDeleted
            FROM validComments vc
            LEFT JOIN forum_comment r
                ON  r.root_comment_id   = vc.id
                AND r.deleted_at        IS NULL
            WHERE (vc.createdAt, vc.id) < (:lastCreatedAt, :lastId)
            GROUP BY vc.id, vc.author, vc.content, vc.createdAt, vc.deletedAt
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
            SELECT  id                      AS id,
                    author                  AS author,
                    content                 AS content,
                    root_comment_id         AS repliedToCommentId,
                    created_at              AS createdAt,
                    0                       AS replyCount,
                    FALSE                   AS isDeleted
            FROM forum_comment
            WHERE   root_comment_id     = :rootCommentId
            AND     (created_at, id)    < (:lastCreatedAt, :lastId)
            AND     deleted_at          IS NULL
            ORDER BY created_at DESC, id DESC
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
