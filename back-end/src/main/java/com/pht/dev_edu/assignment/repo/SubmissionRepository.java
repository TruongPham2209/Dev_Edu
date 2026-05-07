package com.pht.dev_edu.assignment.repo;

import com.pht.dev_edu.assignment.entity.SubmissionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository("assignmentSubmissionRepository")
public interface SubmissionRepository extends JpaRepository<SubmissionEntity, UUID> {
    Page<SubmissionEntity> findByAssignmentIdOrderBySubmittedAtDesc(UUID assignmentId, Pageable pageable);

    @Modifying
    @Query(value = """
                DELETE FROM assignment_submission
                WHERE assignment_id IN :assignmentIds
                RETURNING file_object_key
            """, nativeQuery = true)
    List<String> deleteByAssignmentIdInAndReturnObjectKeys(List<UUID> assignmentIds);

    Optional<SubmissionEntity> findByAssignmentIdAndStudentUsername(UUID assignmentId, String studentUsername);
}
