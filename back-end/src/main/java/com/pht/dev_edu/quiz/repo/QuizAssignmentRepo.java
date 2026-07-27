package com.pht.dev_edu.quiz.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface QuizAssignmentRepo extends JpaRepository<QuizAssignmentRepo, UUID> {
}
