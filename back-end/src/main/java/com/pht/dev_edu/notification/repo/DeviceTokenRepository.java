package com.pht.dev_edu.notification.repo;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pht.dev_edu.notification.entity.DeviceTokenEntity;

public interface DeviceTokenRepository extends JpaRepository<DeviceTokenEntity, UUID> {

    Optional<DeviceTokenEntity> findByFcmToken(String fcmToken);

    List<DeviceTokenEntity> findByUsernameAndActiveTrue(String username);

    @Modifying
    @Query("UPDATE DeviceTokenEntity d SET d.active = false, d.updatedAt = CURRENT_TIMESTAMP WHERE d.fcmToken IN :tokens")
    void deactivateByTokens(@Param("tokens") List<String> tokens);

    @Modifying
    @Query("UPDATE DeviceTokenEntity d SET d.active = false, d.updatedAt = CURRENT_TIMESTAMP WHERE d.fcmToken = :token AND d.username = :username")
    int deactivateByTokenAndUsername(@Param("token") String token, @Param("username") String username);
}
