package com.pht.dev_edu.notification.repo;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pht.dev_edu.notification.entity.NotificationGroupTargetEntity;

public interface NotificationGroupTargetRepository extends JpaRepository<NotificationGroupTargetEntity, UUID> {
    List<NotificationGroupTargetEntity> findByNotificationGroupIdIn(Collection<UUID> notificationGroupIds);
}
