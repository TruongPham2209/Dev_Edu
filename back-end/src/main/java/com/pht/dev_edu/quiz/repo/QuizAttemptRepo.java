package com.pht.dev_edu.quiz.repo;

import com.pht.dev_edu.quiz.dto.enums.AttemptStatus;
import com.pht.dev_edu.quiz.entity.QuizAttemptEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
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

    Optional<QuizAttemptEntity> findByAssignmentIdAndStudentUsernameAndStatus(UUID assignmentId, String studentUsername, AttemptStatus status);

    List<QuizAttemptEntity> findByStatusAndExpiresAtLessThanEqual(AttemptStatus status, LocalDateTime time);

    Page<QuizAttemptEntity> findByStatus(AttemptStatus status, Pageable pageable);
}
