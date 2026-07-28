package com.pht.dev_edu.quiz.repo;

import com.pht.dev_edu.quiz.entity.QuizAuditLogEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizAuditLogRepo extends JpaRepository<QuizAuditLogEntity, UUID> {
    List<QuizAuditLogEntity> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, UUID entityId);

    Page<QuizAuditLogEntity> findByPerformedByOrderByCreatedAtDesc(String performedBy, Pageable pageable);
}
