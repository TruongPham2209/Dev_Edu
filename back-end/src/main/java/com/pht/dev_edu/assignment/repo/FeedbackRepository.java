package com.pht.dev_edu.assignment.repo;

import com.pht.dev_edu.assignment.entity.FeedbackEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface FeedbackRepository extends JpaRepository<FeedbackEntity, UUID> {
    List<FeedbackEntity> findByAssignmentIdAndStudentUsernameOrderByCreatedAtDesc(UUID assignmentId, String studentUsername);

    @Modifying
    @Query(value = """
                DELETE FROM submission_feedback
                WHERE submission_id IN (
                    SELECT id FROM assignment_submission
                    WHERE assignment_id IN :assignmentIds
                )
            """, nativeQuery = true)
    void deleteByAssignmentIdIn(List<UUID> assignmentIds);
}
