package com.pht.dev_edu.assignment.repo;

import com.pht.dev_edu.assignment.dto.SubmissionProjection;
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
    @Query(value = """
                SELECT  s.id                    AS id,
                        s.student_username      AS studentUsername,
                        s.file_object_key       AS fileObjectKey,
                        s.submitted_at          AS submittedAt,
                        f.file_name             AS fileName,
                        f.content_type          AS contentType,
                        f.file_size             AS fileSize
                FROM assignment_submission s
                LEFT JOIN file_upload f
                    ON s.file_object_key = f.object_key
                WHERE s.assignment_id = :assignmentId
                ORDER BY s.submitted_at DESC
            """, countQuery = """
                SELECT COUNT(*)
                FROM assignment_submission s
                WHERE s.assignment_id = :assignmentId
            """, nativeQuery = true)
    Page<SubmissionProjection> findByAssignmentId(UUID assignmentId, Pageable pageable);

    @Modifying
    @Query(value = """
                DELETE FROM assignment_submission
                WHERE assignment_id IN :assignmentIds
                RETURNING file_object_key
            """, nativeQuery = true)
    List<String> deleteByAssignmentIdInAndReturnObjectKeys(List<UUID> assignmentIds);

    Optional<SubmissionEntity> findByAssignmentIdAndStudentUsername(UUID assignmentId, String studentUsername);
}
