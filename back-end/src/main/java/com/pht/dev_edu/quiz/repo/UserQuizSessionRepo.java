package com.pht.dev_edu.quiz.repo;

import com.pht.dev_edu.quiz.entity.UserQuizSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserQuizSessionRepo extends JpaRepository<UserQuizSessionEntity, UUID> {
    Optional<UserQuizSessionEntity> findBySessionTokenAndIsActiveTrue(String sessionToken);

    List<UserQuizSessionEntity> findByUsernameAndIsActiveTrue(String username);

    List<UserQuizSessionEntity> findByIsActiveTrueAndExpiresAtLessThan(LocalDateTime time);
}
