package com.pht.dev_edu.quiz.repo;

import com.pht.dev_edu.quiz.dto.enums.QuizGenerationJobStatus;
import com.pht.dev_edu.quiz.entity.QuizGenerationJobEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuizGenerationJobRepository extends JpaRepository<QuizGenerationJobEntity, UUID> {
    List<QuizGenerationJobEntity> findByCourseIdOrderByCreatedAtDesc(UUID courseId);
    List<QuizGenerationJobEntity> findByCreatedByOrderByCreatedAtDesc(String createdBy);
    Optional<QuizGenerationJobEntity> findFirstByCourseIdAndStatusIn(UUID courseId, List<QuizGenerationJobStatus> statuses);
}
