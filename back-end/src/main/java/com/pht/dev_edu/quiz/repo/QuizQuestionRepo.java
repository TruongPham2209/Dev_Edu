package com.pht.dev_edu.quiz.repo;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import com.pht.dev_edu.quiz.entity.QuizQuestionEntity;

public interface QuizQuestionRepo extends JpaRepository<QuizQuestionEntity, UUID> {
    List<QuizQuestionEntity> findByQuizIdAndDeletedAtIsNullOrderByOrderIndexAsc(UUID quizId);

    Optional<QuizQuestionEntity> findByIdAndDeletedAtIsNull(UUID id);

    List<QuizQuestionEntity> findByIdInAndDeletedAtIsNull(List<UUID> ids);

    int countByQuizIdAndQuestionTypeAndDeletedAtIsNull(UUID quizId, QuestionType questionType);

    boolean existsByQuizIdAndQuestionTypeAndDeletedAtIsNull(UUID quizId, QuestionType questionType);
}
