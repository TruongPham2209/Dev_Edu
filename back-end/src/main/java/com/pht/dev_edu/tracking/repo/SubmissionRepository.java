package com.pht.dev_edu.tracking.repo;

import com.pht.dev_edu.tracking.entity.SubmissionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository("trackingSubmissionRepository")
public interface SubmissionRepository extends JpaRepository<SubmissionEntity, UUID> {
    Page<SubmissionEntity> findByAssignmentIdAndActor(UUID assignmentId, String actor, Pageable pageable);
}
