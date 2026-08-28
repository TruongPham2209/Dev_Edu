package com.pht.dev_edu.notification.repo;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pht.dev_edu.notification.entity.NotificationGroupEntity;

public interface NotificationGroupRepository extends JpaRepository<NotificationGroupEntity, UUID> {
        Optional<NotificationGroupEntity> findByIdAndDeletedAtIsNull(UUID id);

        @Query(value = """
                        SELECT *
                        FROM notification_group
                        WHERE deleted_at IS NULL
                        AND (created_at, id) <= (:createdAt, :id)
                        ORDER BY created_at DESC, id DESC
                        LIMIT :limit
                        """, nativeQuery = true)
        List<NotificationGroupEntity> findActiveWithCursor(
                        @Param("createdAt") LocalDateTime createdAt,
                        @Param("id") UUID id,
                        @Param("limit") int limit);

        @Modifying
        @Query("UPDATE NotificationGroupEntity g SET g.deletedAt = :deletedAt, g.updatedAt = :deletedAt WHERE g.id = :id AND g.deletedAt IS NULL")
        int softDeleteById(@Param("id") UUID id, @Param("deletedAt") LocalDateTime deletedAt);
}
