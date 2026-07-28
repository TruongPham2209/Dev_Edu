package com.pht.dev_edu.quiz.repo;

import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import com.pht.dev_edu.quiz.entity.QuizAttemptAnswerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizAttemptAnswerRepo extends JpaRepository<QuizAttemptAnswerEntity, UUID> {
    List<QuizAttemptAnswerEntity> findByAttemptId(UUID attemptId);

    Optional<QuizAttemptAnswerEntity> findByAttemptIdAndQuestionId(UUID attemptId, UUID questionId);

    int countByAttemptIdAndQuestionTypeAndAwardedPointsIsNull(UUID attemptId, QuestionType questionType);

    List<QuizAttemptAnswerEntity> findByAttemptIdAndQuestionTypeAndAwardedPointsIsNull(UUID attemptId, QuestionType questionType);
}
