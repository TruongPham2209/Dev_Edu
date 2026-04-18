package com.pht.dev_edu.assignment.repo;

import com.pht.dev_edu.assignment.dto.AssignmentProjection;
import com.pht.dev_edu.assignment.entity.AssignmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface AssignmentRepository extends JpaRepository<AssignmentEntity, UUID> {
    List<AssignmentEntity> findByLectureIdAndDeletedAtIsNull(UUID lectureId);

    @Query(value = """
                SELECT  a.id                    AS id,
                        a.title                 AS title,
                        a.description           AS description,
                        a.created_at            AS createdAt,
                        s.file_object_key       AS fileObjectKey,
                        s.submitted_at          AS submittedAt
                FROM assignment a
                LEFT JOIN submission s
                    ON  a.id = s.assignment_id
                    AND s.student_username = :student
                WHERE   a.lecture_id = :lectureId
                AND     a.deleted_at IS NULL
                ORDER BY a.created_at DESC
            """, nativeQuery = true)
    List<AssignmentProjection> findByLectureIdAndStudentUsername(UUID lectureId, String studentUsername);

    @Query("""
                SELECT a.id
                FROM AssignmentEntity a 
                WHERE a.deletedAt IS NOT NULL
                  AND a.deletedAt < :cutoffTime
            """)
    List<UUID> findDeletedAssignmentIdsBeforeCutoffTime(java.time.LocalDateTime cutoffTime);
}