package com.pht.dev_edu.notification.repo;

import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.notification.entity.NotificationGroupReadStatusEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationGroupReadStatusRepository extends JpaRepository<NotificationGroupReadStatusEntity, UUID> {
        @Modifying
        @Query(value = """
                        INSERT INTO notification_group_read_status( id, notification_group_id, username, is_read, read_at, created_at, updated_at )
                        VALUES ( :id, :groupId, :username, true, :now, :now, :now )
                        ON CONFLICT (username, notification_group_id)
                        DO UPDATE
                        SET is_read = true,
                            read_at = COALESCE( notification_group_read_status.read_at, EXCLUDED.read_at ),
                            updated_at = EXCLUDED.updated_at
                        WHERE notification_group_read_status.is_read = false
                        """, nativeQuery = true)
        void upsertReadStatus(
                        @Param("id") UUID id,
                        @Param("groupId") UUID groupId,
                        @Param("username") String username,
                        @Param("now") LocalDateTime now);

        @Modifying
        @Query(value = """
                        INSERT INTO notification_group_read_status( id, notification_group_id, username, is_read, read_at, created_at, updated_at )
                        SELECT u.id, u.group_id, :username, true, :now, :now, :now
                        FROM UNNEST(string_to_array(:idsStr, ',')::uuid[], string_to_array(:groupIdsStr, ',')::uuid[]) AS u(id, group_id)
                        ON CONFLICT (username, notification_group_id)
                        DO UPDATE
                        SET is_read = true,
                            read_at = COALESCE( notification_group_read_status.read_at, EXCLUDED.read_at ),
                            updated_at = EXCLUDED.updated_at
                        WHERE notification_group_read_status.is_read = false
                        """, nativeQuery = true)
        void batchUpsertReadStatus(
                        @Param("idsStr") String idsStr,
                        @Param("groupIdsStr") String groupIdsStr,
                        @Param("username") String username,
                        @Param("now") LocalDateTime now);

        @Query("""
                        SELECT DISTINCT g.id
                        FROM NotificationGroupEntity g
                        JOIN NotificationGroupTargetEntity t
                            ON g.id = t.notificationGroupId
                        WHERE g.deletedAt IS NULL
                        AND t.role IN :roles
                        AND g.createdAt >= :timestamp
                        AND NOT EXISTS (
                          SELECT 1
                          FROM NotificationGroupReadStatusEntity s
                          WHERE s.username = :username
                          AND s.notificationGroupId = g.id
                          AND s.isRead = true
                        )
                        """)
        List<UUID> findUnreadGroupIdsByRolesAndTimestamp(
                        @Param("roles") Collection<RoleEnum> roles,
                        @Param("username") String username,
                        @Param("timestamp") LocalDateTime timestamp);

        @Query("""
                        SELECT COUNT(DISTINCT g.id)
                        FROM NotificationGroupEntity g
                        JOIN NotificationGroupTargetEntity t
                            ON g.id = t.notificationGroupId
                        WHERE   g.deletedAt IS NULL
                        AND     t.role      IN :roles
                        AND NOT EXISTS (
                          SELECT 1
                          FROM NotificationGroupReadStatusEntity s
                          WHERE s.username              = :username
                          AND   s.notificationGroupId   = g.id
                        )
                        """)
        long countUnreadGroupNotificationsByRolesAndUsername(@Param("roles") Collection<RoleEnum> roles,
                        @Param("username") String username);
}
