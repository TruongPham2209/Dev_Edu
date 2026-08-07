package com.pht.dev_edu.notification.repo;

import com.pht.dev_edu.notification.entity.NotificationGroupEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationGroupRepository extends JpaRepository<NotificationGroupEntity, UUID> {
    Optional<NotificationGroupEntity> findByIdAndDeletedAtIsNull(UUID id);

    @Query("SELECT g FROM NotificationGroupEntity g WHERE g.deletedAt IS NULL " +
            "AND (g.createdAt < :createdAt OR (g.createdAt = :createdAt AND g.id < :id)) " +
            "ORDER BY g.createdAt DESC, g.id DESC LIMIT :limit")
    List<NotificationGroupEntity> findActiveWithCursor(
            @Param("createdAt") LocalDateTime createdAt,
            @Param("id") UUID id,
            @Param("limit") int limit);

    @Query("SELECT DISTINCT g FROM NotificationGroupEntity g " +
            "JOIN NotificationGroupTargetEntity t ON g.id = t.notificationGroupId " +
            "WHERE g.deletedAt IS NULL AND t.role IN :roles " +
            "ORDER BY g.createdAt DESC, g.id DESC LIMIT :limit")
    List<NotificationGroupEntity> findActiveByRoles(@Param("roles") Collection<String> roles,
            @Param("limit") int limit);

    @Query("SELECT DISTINCT g FROM NotificationGroupEntity g " +
            "JOIN NotificationGroupTargetEntity t ON g.id = t.notificationGroupId " +
            "WHERE g.deletedAt IS NULL AND t.role IN :roles " +
            "AND (g.createdAt < :createdAt OR (g.createdAt = :createdAt AND g.id < :id)) " +
            "ORDER BY g.createdAt DESC, g.id DESC LIMIT :limit")
    List<NotificationGroupEntity> findActiveByRolesWithCursor(
            @Param("roles") Collection<String> roles,
            @Param("createdAt") LocalDateTime createdAt,
            @Param("id") UUID id,
            @Param("limit") int limit);

    @Modifying
    @Query("UPDATE NotificationGroupEntity g SET g.deletedAt = :deletedAt, g.updatedAt = :deletedAt WHERE g.id = :id AND g.deletedAt IS NULL")
    int softDeleteById(@Param("id") UUID id, @Param("deletedAt") LocalDateTime deletedAt);
}
