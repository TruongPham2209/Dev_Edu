package com.pht.dev_edu.quiz.repo;

import com.pht.dev_edu.quiz.dto.enums.AttemptStatus;
import com.pht.dev_edu.quiz.entity.QuizAttemptEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizAttemptRepo extends JpaRepository<QuizAttemptEntity, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM QuizAttemptEntity a WHERE a.id = :id")
    Optional<QuizAttemptEntity> findByIdForUpdate(@Param("id") UUID id);

    int countByAssignmentIdAndStudentUsername(UUID assignmentId, String studentUsername);

    boolean existsByAssignmentId(UUID assignmentId);

    Optional<QuizAttemptEntity> findByAssignmentIdAndStudentUsernameAndStatus(UUID assignmentId, String studentUsername, AttemptStatus status);

    List<QuizAttemptEntity> findByStatusAndExpiresAtLessThanEqual(AttemptStatus status, LocalDateTime time);

    List<QuizAttemptEntity> findByAssignmentIdAndStudentUsernameAndStatusNotOrderByAttemptNumberAsc(UUID assignmentId, String studentUsername, AttemptStatus status);


    @Modifying
    @Query("UPDATE QuizAttemptEntity a SET a.lastHeartbeatAt = :now WHERE a.id = :id AND a.status = com.pht.dev_edu.quiz.dto.enums.AttemptStatus.IN_PROGRESS AND a.activeSessionToken = :sessionToken")
    int updateHeartbeat(@Param("id") UUID id, @Param("sessionToken") String sessionToken, @Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE QuizAttemptEntity a SET a.activeSessionToken = :sessionToken, a.lockAcquiredAt = :now, a.lastHeartbeatAt = :now WHERE a.id = :id AND a.status = com.pht.dev_edu.quiz.dto.enums.AttemptStatus.IN_PROGRESS")
    int updateHeartbeatStealLock(@Param("id") UUID id, @Param("sessionToken") String sessionToken, @Param("now") LocalDateTime now);

    @Query(value = """
            SELECT *
            FROM quiz_attempts
            WHERE   quiz_id             = :quizId
            AND     status              = :status
            AND     (submitted_at, id)  <= (:lastTimestamp, :lastId)
            ORDER BY submitted_at DESC, id DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<QuizAttemptEntity> findByQuizIdAndStatusAndCursor(UUID quizId, String status, UUID lastId, LocalDateTime lastTimestamp, int limit);
}

