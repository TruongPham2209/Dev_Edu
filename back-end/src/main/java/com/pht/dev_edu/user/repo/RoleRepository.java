package com.pht.dev_edu.user.repo;

import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.user.entity.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<RoleEntity, UUID> {
    Optional<RoleEntity> findByName(RoleEnum name);
}
