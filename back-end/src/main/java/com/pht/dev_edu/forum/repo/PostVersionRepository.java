package com.pht.dev_edu.forum.repo;

import com.pht.dev_edu.forum.dto.PostStatus;
import com.pht.dev_edu.forum.dto.SupersededVersionProjection;
import com.pht.dev_edu.forum.entity.PostVersionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface PostVersionRepository extends JpaRepository<PostVersionEntity, UUID> {
    @Modifying // Remove if query throws an exception about "Modifying queries can only use void or int as return type!"
    @Query(value = """
            UPDATE forum_post_version
            SET status = 'SUPERSEDED'
            WHERE post_id           = :postId
              AND status            = 'PENDING'
              AND version_number    < :version
            RETURNING id, thumb_object_key AS thumbnailObjectKey
            """, nativeQuery = true)
    List<SupersededVersionProjection> supersededOldVersionByPostId(UUID postId, int version);

    boolean existsByPostIdAndStatusIn(UUID postId, List<PostStatus> statuses);

    @Query(value = """
            SELECT EXISTS (
                SELECT 1
                FROM forum_post_version p
                JOIN forum_post fp
                    ON fp.id = p.post_id
                WHERE   p.id        = :postVersionId
                AND     fp.author   = :author
            )
            """, nativeQuery = true)
    boolean isOwnerOfPostVersion(String author, UUID postVersionId);

    @Modifying
    @Query(value = """
            DELETE FROM forum_post_version
            WHERE   id      = :postVersionId
            AND     status  = :status
            RETURNING thumb_object_key
            """, nativeQuery = true)
    List<String> deleteByIdAndStatusThenReturnObjectKeys(UUID postVersionId, String status);

    List<PostVersionEntity> findByPostIdAndStatusOrderByVersionNumberDesc(UUID postId, PostStatus status);

    @Query(value = """
            SELECT *
            FROM forum_post_version pv
            WHERE   (pv.updated_at, pv.id)  < (:lastUpdatedAt, :lastId)
            AND     pv.status               = :status
            """, countQuery = """
            SELECT COUNT(*)
            FROM forum_post_version pv
            WHERE   pv.status = :status
            """,
            nativeQuery = true)
    Page<PostVersionEntity> findByStatusAndCursor(String status, UUID lastId, LocalDateTime lastUpdatedAt, org.springframework.data.domain.Pageable pageable);

    @Modifying
    @Query(value = """
            DELETE FROM forum_post_version fv
            WHERE NOT EXISTS (
                SELECT 1
                FROM forum_post fp
                WHERE fp.id = fv.post_id
            )
            RETURNING fv.thumb_object_key
            """, nativeQuery = true)
    List<String> deleteByInvalidPostThenReturnObjectKeys();

    @Query(value = """
            SELECT COALESCE(MAX(version_number), 0) + 1
            FROM forum_post_version
            WHERE post_id = :postId
            """, nativeQuery = true)
    int getNextVersionNumberByPostId(UUID postId);
}
