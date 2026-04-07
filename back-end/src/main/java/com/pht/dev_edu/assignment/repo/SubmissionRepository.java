package com.pht.dev_edu.assignment.repo;

import com.pht.dev_edu.assignment.entity.SubmissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SubmissionRepository extends JpaRepository<SubmissionEntity, UUID> {
}
