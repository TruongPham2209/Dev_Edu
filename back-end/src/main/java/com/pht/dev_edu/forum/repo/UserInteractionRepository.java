package com.pht.dev_edu.forum.repo;

import com.pht.dev_edu.forum.entity.SavedPostEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface UserInteractionRepository extends JpaRepository<SavedPostEntity, UUID> {

    @Query(value = """
            WITH user_signals AS (
                SELECT post_id, 5.0 AS signal_weight, saved_at AS interaction_time
                FROM saved_post
                WHERE username = :username
                
                UNION ALL
                
                SELECT post_id, 3.0 AS signal_weight, created_at AS interaction_time
                FROM forum_comment
                WHERE author = :username AND deleted_at IS NULL
            ),
            decayed_signals AS (
                SELECT 
                    post_id,
                    signal_weight * (
                        CASE 
                            WHEN interaction_time >= CURRENT_TIMESTAMP - CAST('30 days' AS INTERVAL) THEN 1.0
                            WHEN interaction_time >= CURRENT_TIMESTAMP - CAST('90 days' AS INTERVAL) THEN 0.5
                            ELSE 0.1
                        END
                    ) AS final_weight
                FROM user_signals
            )
            SELECT CAST(post_id AS VARCHAR)
            FROM decayed_signals
            GROUP BY post_id
            ORDER BY SUM(final_weight) DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<String> getUserInteractedPostIdsWeighted(@Param("username") String username, @Param("limit") int limit);

    @Query(value = """
            SELECT s2.post_id AS post_id, CAST(COUNT(*) AS DOUBLE PRECISION) AS co_occurrence_count
            FROM saved_post s1
            JOIN saved_post s2 ON s1.username = s2.username
            WHERE s1.post_id = :postId AND s2.post_id <> :postId
            GROUP BY s2.post_id
            ORDER BY co_occurrence_count DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Object[]> getSaveCoOccurrence(@Param("postId") UUID postId, @Param("limit") int limit);
}
