package com.pht.dev_edu.quiz.repo;

import com.pht.dev_edu.quiz.dto.enums.QuizStatus;
import com.pht.dev_edu.quiz.entity.QuizEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizRepo extends JpaRepository<QuizEntity, UUID> {
    Optional<QuizEntity> findByIdAndDeletedAtIsNull(UUID id);

    List<QuizEntity> findByCourseIdAndDeletedAtIsNull(UUID courseId);

    Page<QuizEntity> findByCourseIdAndDeletedAtIsNull(UUID courseId, Pageable pageable);

    Page<QuizEntity> findByStatusAndDeletedAtIsNull(QuizStatus status, Pageable pageable);

    Page<QuizEntity> findByCreatedByAndDeletedAtIsNull(String createdBy, Pageable pageable);
}
