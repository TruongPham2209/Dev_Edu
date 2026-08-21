package com.pht.dev_edu.quiz.repo;

import com.pht.dev_edu.quiz.entity.QuizQuestionSourceTraceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuizQuestionSourceTraceRepository extends JpaRepository<QuizQuestionSourceTraceEntity, UUID> {
    Optional<QuizQuestionSourceTraceEntity> findByQuestionId(UUID questionId);
    List<QuizQuestionSourceTraceEntity> findByGenerationJobId(UUID generationJobId);
}
