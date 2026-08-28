package com.pht.dev_edu.quiz.repo;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pht.dev_edu.quiz.entity.QuizQuestionOptionEntity;

public interface QuizQuestionOptionRepo extends JpaRepository<QuizQuestionOptionEntity, UUID> {
    List<QuizQuestionOptionEntity> findByQuestionIdInAndDeletedAtIsNullOrderByOrderIndexAsc(List<UUID> questionIds);

    List<QuizQuestionOptionEntity> findByQuestionIdInAndIsCorrectTrueAndDeletedAtIsNull(List<UUID> questionIds);

    void deleteByQuestionId(UUID questionId);
}
