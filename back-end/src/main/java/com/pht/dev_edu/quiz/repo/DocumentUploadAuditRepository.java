package com.pht.dev_edu.quiz.repo;

import com.pht.dev_edu.quiz.entity.DocumentUploadAuditEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentUploadAuditRepository extends JpaRepository<DocumentUploadAuditEntity, UUID> {
    Optional<DocumentUploadAuditEntity> findByGenerationJobId(UUID generationJobId);
    List<DocumentUploadAuditEntity> findByCourseIdOrderByCreatedAtDesc(UUID courseId);
    List<DocumentUploadAuditEntity> findByUploadedByOrderByCreatedAtDesc(String uploadedBy);
}
