package com.pht.dev_edu.quiz.repo;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pht.dev_edu.quiz.entity.UserQuizSessionEntity;

public interface UserQuizSessionRepo extends JpaRepository<UserQuizSessionEntity, UUID> {
    List<UserQuizSessionEntity> findByIsActiveTrueAndExpiresAtLessThan(LocalDateTime time);
}
