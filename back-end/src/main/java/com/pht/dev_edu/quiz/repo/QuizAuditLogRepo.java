package com.pht.dev_edu.quiz.repo;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pht.dev_edu.quiz.entity.QuizAuditLogEntity;

public interface QuizAuditLogRepo extends JpaRepository<QuizAuditLogEntity, UUID> {
}
