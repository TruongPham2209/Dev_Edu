package com.pht.dev_edu.assignment.repo;

import com.pht.dev_edu.assignment.dto.FeedbackProjection;
import com.pht.dev_edu.assignment.entity.FeedbackEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface FeedbackRepository extends JpaRepository<FeedbackEntity, UUID> {
    @Query(value = """
                SELECT  f.id            AS id,
                        f.feedback      AS feedback,
                        f.lecturer      AS lecturer,
                        u.full_name     AS lecturerFullName,
                        u.avatar_url    AS lecturerAvatar,
                        f.created_at    AS createdAt
                FROM submission_feedback f
                INNER JOIN "user" u
                    ON f.lecturer = u.username
                WHERE   f.assignment_id     = :assignmentId
                AND     f.student_username  = :studentUsername
                ORDER BY f.created_at DESC
            """, nativeQuery = true)
    List<FeedbackProjection> findByAssignmentIdAndStudentUsername(UUID assignmentId, String studentUsername);

    @Modifying
    @Query(value = """
                DELETE FROM submission_feedback
                WHERE assignment_id IN :assignmentIds
            """, nativeQuery = true)
    void deleteByAssignmentIdIn(List<UUID> assignmentIds);
}
