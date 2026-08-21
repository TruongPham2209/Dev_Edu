package com.pht.dev_edu.quiz.repo;

import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import com.pht.dev_edu.quiz.entity.QuizQuestionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizQuestionRepo extends JpaRepository<QuizQuestionEntity, UUID> {
    List<QuizQuestionEntity> findByQuizIdAndDeletedAtIsNullOrderByOrderIndexAsc(UUID quizId);

    Optional<QuizQuestionEntity> findByIdAndDeletedAtIsNull(UUID id);

    List<QuizQuestionEntity> findByIdInAndDeletedAtIsNull(List<UUID> ids);

    int countByQuizIdAndQuestionTypeAndDeletedAtIsNull(UUID quizId, QuestionType questionType);

    boolean existsByQuizIdAndQuestionTypeAndDeletedAtIsNull(UUID quizId, QuestionType questionType);

    @org.springframework.data.jpa.repository.Query("SELECT q FROM QuizQuestionEntity q JOIN QuizEntity qz ON q.quizId = qz.id WHERE qz.courseId = :courseId AND q.deletedAt IS NULL AND qz.deletedAt IS NULL")
    List<QuizQuestionEntity> findByCourseId(@org.springframework.data.repository.query.Param("courseId") UUID courseId);
}
