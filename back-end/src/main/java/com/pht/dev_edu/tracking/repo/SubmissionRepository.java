package com.pht.dev_edu.tracking.repo;

import com.pht.dev_edu.tracking.entity.SubmissionTrackingEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository("trackingSubmissionRepository")
public interface SubmissionRepository extends JpaRepository<SubmissionTrackingEntity, UUID> {
    Page<SubmissionTrackingEntity> findByAssignmentIdAndActor(UUID assignmentId, String actor, Pageable pageable);
}
