package com.pht.dev_edu.quiz.repo;

import com.pht.dev_edu.quiz.entity.QuizAttemptAnswerLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizAttemptAnswerLogRepo extends JpaRepository<QuizAttemptAnswerLogEntity, UUID> {
    Optional<QuizAttemptAnswerLogEntity> findFirstByAttemptIdAndQuestionIdOrderByClientSeqDesc(UUID attemptId, UUID questionId);

    List<QuizAttemptAnswerLogEntity> findByAttemptIdAndQuestionIdOrderBySavedAtDesc(UUID attemptId, UUID questionId);
}
