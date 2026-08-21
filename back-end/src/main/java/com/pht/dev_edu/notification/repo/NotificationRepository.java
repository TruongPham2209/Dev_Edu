package com.pht.dev_edu.notification.repo;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pht.dev_edu.notification.dto.UnifiedNotificationProjection;
import com.pht.dev_edu.notification.entity.NotificationPersonalEntity;

public interface NotificationRepository extends JpaRepository<NotificationPersonalEntity, UUID> {

        @Query(value = """
                        SELECT  n.id            AS id,
                                n.username      AS username,
                                n.type          AS type,
                                n.title         AS title,
                                n.content       AS content,
                                n.target_data   AS targetData,
                                n.is_read       AS isRead,
                                n.read_at       AS readAt,
                                n.created_at    AS createdAt,
                                n.category      AS category,
                                n.created_by    AS createdBy
                        FROM (
                            SELECT  p.id                    AS id,
                                    p.username              AS username,
                                    p.type                  AS type,
                                    p.title                 AS title,
                                    p.content               AS content,
                                    p.target_data           AS target_data,
                                    p.is_read               AS is_read,
                                    p.read_at               AS read_at,
                                    p.created_at            AS created_at,
                                    'PERSONAL'              AS category,
                                    CAST(NULL AS VARCHAR)   AS created_by
                            FROM notification_personal p
                            WHERE   p.username = :username
                            AND     (p.created_at, p.id) <= (:cursorCreatedAt, :cursorId)

                            UNION ALL

                            SELECT  g.id                            AS id,
                                    :username                       AS username,
                                    g.type                          AS type,
                                    g.title                         AS title,
                                    g.content                       AS content,
                                    g.target_data                   AS target_data,
                                    COALESCE(rs.is_read, FALSE)     AS is_read,
                                    rs.read_at                      AS read_at,
                                    g.created_at                    AS created_at,
                                    'GROUP'                         AS category,
                                    g.created_by                    AS created_by
                            FROM notification_group g
                            LEFT JOIN notification_group_read_status rs
                                ON  rs.notification_group_id    = g.id
                                AND rs.username                 = :username
                            WHERE g.deleted_at IS NULL
                            AND EXISTS (
                                SELECT 1
                                FROM notification_group_target tgt
                                WHERE   tgt.notification_group_id   = g.id
                                AND     tgt.role                    IN (:roles)
                            )
                            AND (g.created_at, g.id) <= (:cursorCreatedAt, :cursorId)
                        ) n
                        ORDER BY n.created_at DESC, n.id DESC
                        LIMIT :limit
                        """, nativeQuery = true)
        List<UnifiedNotificationProjection> findUnifiedNotificationsWithCursor(
                        @Param("username") String username,
                        @Param("roles") Collection<String> roles,
                        @Param("cursorCreatedAt") LocalDateTime cursorCreatedAt,
                        @Param("cursorId") UUID cursorId,
                        @Param("limit") int limit);
}
