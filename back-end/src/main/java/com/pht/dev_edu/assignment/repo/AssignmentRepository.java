package com.pht.dev_edu.assignment.repo;

import com.pht.dev_edu.assignment.entity.AssignmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AssignmentRepository extends JpaRepository<AssignmentEntity, UUID> {
    List<AssignmentEntity> findByLectureIdAndDeletedAtIsNull(UUID lectureId);
}