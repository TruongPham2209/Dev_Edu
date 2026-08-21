package com.pht.dev_edu.quiz.repo;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pht.dev_edu.quiz.entity.QuizAttemptAnswerLogEntity;

public interface QuizAttemptAnswerLogRepo extends JpaRepository<QuizAttemptAnswerLogEntity, UUID> {
    Optional<QuizAttemptAnswerLogEntity> findFirstByAttemptIdAndQuestionIdOrderByClientSeqDesc(UUID attemptId,
            UUID questionId);

    List<QuizAttemptAnswerLogEntity> findByAttemptIdOrderByClientSeqAsc(UUID attemptId);
}
