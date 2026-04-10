package com.pht.dev_edu.tracking.repo;

import com.pht.dev_edu.tracking.entity.SubmissionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SubmissionRepository extends JpaRepository<SubmissionEntity, UUID> {
    Page<SubmissionEntity> findByAssignmentIdAndActor(UUID assignmentId, String actor, Pageable pageable);
}
