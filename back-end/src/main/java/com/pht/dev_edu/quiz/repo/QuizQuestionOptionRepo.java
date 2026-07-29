package com.pht.dev_edu.quiz.repo;

import com.pht.dev_edu.quiz.entity.QuizQuestionOptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface QuizQuestionOptionRepo extends JpaRepository<QuizQuestionOptionEntity, UUID> {
    List<QuizQuestionOptionEntity> findByQuestionIdInAndDeletedAtIsNullOrderByOrderIndexAsc(List<UUID> questionIds);

    List<QuizQuestionOptionEntity> findByQuestionIdInAndDeletedAtIsNull(Collection<UUID> questionIds);

    List<QuizQuestionOptionEntity> findByQuestionIdAndIsCorrectTrueAndDeletedAtIsNull(UUID questionId);

    void deleteByQuestionId(UUID questionId);
}
