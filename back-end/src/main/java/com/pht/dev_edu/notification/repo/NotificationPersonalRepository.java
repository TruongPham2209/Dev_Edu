package com.pht.dev_edu.notification.repo;

import com.pht.dev_edu.notification.entity.NotificationPersonalEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationPersonalRepository extends JpaRepository<NotificationPersonalEntity, UUID> {
    @Query("SELECT n FROM NotificationPersonalEntity n WHERE n.username = :username " +
           "AND (n.createdAt < :createdAt OR (n.createdAt = :createdAt AND n.id < :id)) " +
           "ORDER BY n.createdAt DESC, n.id DESC")
    List<NotificationPersonalEntity> findByUsernameWithCursor(
            @Param("username") String username,
            @Param("createdAt") LocalDateTime createdAt,
            @Param("id") UUID id,
            Pageable pageable
    );

    long countByUsernameAndIsReadFalse(String username);

    Optional<NotificationPersonalEntity> findByIdAndUsername(UUID id, String username);

    @Modifying
    @Query("UPDATE NotificationPersonalEntity n SET n.isRead = true, n.readAt = :readAt, n.updatedAt = :readAt " +
           "WHERE n.username = :username AND n.isRead = false")
    void markAllAsReadByUsername(@Param("username") String username, @Param("readAt") LocalDateTime readAt);

    @Modifying
    @Query("UPDATE NotificationPersonalEntity n SET n.isRead = true, n.readAt = :readAt, n.updatedAt = :readAt " +
           "WHERE n.id = :id AND n.username = :username AND n.isRead = false")
    void markAsReadByIdAndUsername(@Param("id") UUID id, @Param("username") String username, @Param("readAt") LocalDateTime readAt);
}
