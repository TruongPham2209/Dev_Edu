package com.pht.dev_edu.user.repo;

import com.pht.dev_edu.common.dto.ProviderEnum;
import com.pht.dev_edu.user.entity.AuthProviderEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AuthProviderRepository extends JpaRepository<AuthProviderEntity, UUID> {
    boolean existsByUserIdAndProviderIdAndProvider(UUID userId, String providerId, ProviderEnum provider);
}