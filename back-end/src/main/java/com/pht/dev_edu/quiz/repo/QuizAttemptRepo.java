package com.pht.dev_edu.quiz.repo;

import com.pht.dev_edu.quiz.entity.QuizAttemptEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface QuizAttemptRepo extends JpaRepository<QuizAttemptEntity, UUID> {
}
