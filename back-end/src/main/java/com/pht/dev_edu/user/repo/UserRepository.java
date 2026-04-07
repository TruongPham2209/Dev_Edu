package com.pht.dev_edu.user.repo;

import com.pht.dev_edu.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByUsername(String username);

    Optional<UserEntity> findByEmail(String email);

    boolean existsByUsernameInOrEmailIn(List<String> usernames, List<String> emails);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
