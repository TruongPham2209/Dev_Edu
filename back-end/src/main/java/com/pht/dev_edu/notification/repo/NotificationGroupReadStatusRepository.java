package com.pht.dev_edu.notification.repo;

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

    List<NotificationGroupReadStatusEntity> findByUsernameAndNotificationGroupIdIn(String username, Collection<UUID> notificationGroupIds);

    @Modifying
    @Query(value = "INSERT INTO notification_group_read_status (id, notification_group_id, username, is_read, read_at, created_at, updated_at) " +
            "VALUES (:id, :groupId, :username, true, :now, :now, :now) " +
            "ON CONFLICT (notification_group_id, username) " +
            "DO UPDATE SET is_read = true, read_at = EXCLUDED.read_at, updated_at = EXCLUDED.updated_at",
            nativeQuery = true)
    void upsertReadStatus(
            @Param("id") UUID id,
            @Param("groupId") UUID groupId,
            @Param("username") String username,
            @Param("now") LocalDateTime now
    );

    @Query("SELECT COUNT(DISTINCT g.id) FROM NotificationGroupEntity g " +
            "JOIN NotificationGroupTargetEntity t ON g.id = t.notificationGroupId " +
            "WHERE g.deletedAt IS NULL AND t.role IN :roles " +
            "AND NOT EXISTS (" +
            "  SELECT 1 FROM NotificationGroupReadStatusEntity s " +
            "  WHERE s.notificationGroupId = g.id AND s.username = :username AND s.isRead = true" +
            ")")
    long countUnreadGroupNotificationsByRolesAndUsername(@Param("roles") Collection<String> roles, @Param("username") String username);
}
