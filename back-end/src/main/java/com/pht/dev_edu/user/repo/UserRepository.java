package com.pht.dev_edu.user.repo;

import com.pht.dev_edu.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByUsername(String username);

    Optional<UserEntity> findByEmail(String email);

    boolean existsByUsernameInOrEmailIn(List<String> usernames, List<String> emails);

    boolean existsByUsername(String username);

    @Query(value = """
            SELECT COUNT(ur.user_id)
            FROM user_role ur
            JOIN "user" u
                ON u.id = ur.user_id
            JOIN role r
                ON r.id = ur.role_id
            WHERE   u.username IN :usernames
            AND     r.name = :role
            """, nativeQuery = true)
    int countByUsernamesAndRole(List<String> usernames, String role);
}
