package com.pht.dev_edu.assignment.repo;

import com.pht.dev_edu.assignment.entity.SubmissionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository("assignmentSubmissionRepository")
public interface SubmissionRepository extends JpaRepository<SubmissionEntity, UUID> {
    Page<SubmissionEntity> findByAssignmentId(UUID assignmentId, Pageable pageable);
}
