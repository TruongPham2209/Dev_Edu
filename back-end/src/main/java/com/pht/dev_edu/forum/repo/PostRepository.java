package com.pht.dev_edu.forum.repo;

import com.pht.dev_edu.forum.dto.PostDetailProjection;
import com.pht.dev_edu.forum.entity.PostEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface PostRepository extends JpaRepository<PostEntity, UUID> {
    int deleteByDeletedAtIsBefore(java.time.LocalDateTime cutoff);

    @Query(value = """
    SELECT  p.id                        AS id,
            pv.title                    AS title,
            pv.short_description        AS shortDescription,
            pv.content                  AS content,
            pv.thumb_url                AS thumbUrl,
            pv.status                   AS status,
            0                           AS views,
            (
                SELECT COUNT(*)
                FROM forum_comment fc
                WHERE   fc.post_id      = p.id
                AND     fc.deleted_at   IS NULL
            )                           AS comments,
            p.created_at                AS createdAt,
            p.updated_at                AS updatedAt,
            p.author                    AS authorUsername,
            u.full_name                 AS authorFullName,
            u.avatar_url                AS authorAvatarUrl
    FROM forum_post p
    LEFT JOIN forum_post_version pv
        ON p.current_version_id = pv.id
    LEFT JOIN "user" u
        ON p.author = u.username
    WHERE p.id = :id
    """, nativeQuery = true)
    Optional<PostDetailProjection> getPostDetailById(UUID id);
}
