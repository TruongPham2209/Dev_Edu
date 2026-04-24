package com.pht.dev_edu.forum.repo;

import com.pht.dev_edu.forum.dto.SavedPostProjection;
import com.pht.dev_edu.forum.entity.SavedPostEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface SavedPostRepository extends JpaRepository<SavedPostEntity, UUID> {
    @Modifying
    @Query(value = """
            INSERT INTO saved_post (post_id, username)
            VALUES (:postId, :username)
            ON CONFLICT DO NOTHING
            """, nativeQuery = true)
    void insertSavedPost(String username, UUID postId);

    @Modifying
    void deleteByPostIdAndUsername(UUID postId, String username);

    @Query(value = """
            SELECT  sv.id                   AS id,
                    sv.post_id              AS postId,
                    pv.title                AS title,
                    pv.short_description    AS shortDescription,
                    pv.thumb_url            AS thumbUrl,
                    sv.saved_at             AS savedAt
            FROM saved_post sv
            JOIN forum_post p
                ON  sv.post_id              = p.id
                AND p.deleted_at            IS NULL
                AND p.current_version_id    IS NOT NULL
            LEFT JOIN forum_post_version pv
                ON  p.current_version_id = pv.id
            WHERE   sv.username = :username
            AND     (sv.saved_at, sv.id) < (:lastSavedAt, :lastId)
            """, countQuery = """
            SELECT COUNT(sv.post_id)
            FROM saved_post sv
            JOIN forum_post p
                ON  sv.post_id              = p.id
                AND p.deleted_at            IS NULL
                AND p.current_version_id    IS NOT NULL
            WHERE   sv.username = :username
            """, nativeQuery = true)
    Page<SavedPostProjection> findByUsernameAndCursor(String username, UUID lastId, LocalDateTime lastSavedAt, Pageable pageable);

    @Modifying
    @Query(value = """
            DELETE FROM saved_post sp
            WHERE post_id NOT EXISTS (
                SELECT 1
                FROM forum_post p
                WHERE p.id = sp.post_id
            )
            RETURNING sp.id
            """, nativeQuery = true)
    List<UUID> deleteByInvalidPostReference();
}