package com.pht.dev_edu.quiz.repo;

import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import com.pht.dev_edu.quiz.entity.QuizQuestionTypeConfigEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizQuestionTypeConfigRepo extends JpaRepository<QuizQuestionTypeConfigEntity, UUID> {
    List<QuizQuestionTypeConfigEntity> findByQuizId(UUID quizId);

    Optional<QuizQuestionTypeConfigEntity> findByQuizIdAndQuestionType(UUID quizId, QuestionType questionType);

    boolean existsByQuizIdAndQuestionType(UUID quizId, QuestionType questionType);
}
