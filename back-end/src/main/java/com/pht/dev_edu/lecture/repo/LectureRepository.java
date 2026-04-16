package com.pht.dev_edu.lecture.repo;

import com.pht.dev_edu.lecture.dto.LectureProjection;
import com.pht.dev_edu.lecture.entity.LectureEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LectureRepository extends JpaRepository<LectureEntity, UUID> {
    @Query(value = """
                SELECT  l.id AS id,
                        l.title AS title,
                        l.summary AS summary,
                        l.content AS content,
                        l.video_object_key AS videoObjectKey,
                        l.lecture_order AS lectureOrder,
                        l.uploaded_at AS uploadedAt,
                        CASE
                            WHEN lp.lecture_id IS NOT NULL THEN TRUE
                            ELSE FALSE
                        END AS completed
                FROM lecture l
                JOIN lecture_progress lp
                    ON  l.id        = lp.lecture_id
                    AND lp.student  = :username
                WHERE   l.id = :lectureId
            """, nativeQuery = true)
    Optional<LectureProjection> findLectureDetailByIdAndUsername(UUID lectureId, String username);

    @Query(value = """
                SELECT  l.id AS id,
                        l.title AS title,
                        l.summary AS summary,
                        l.content AS content,
                        l.video_object_key AS videoObjectKey,
                        l.lecture_order AS lectureOrder,
                        l.uploaded_at AS uploadedAt,
                        CASE
                            WHEN lp.lecture_id IS NOT NULL THEN TRUE
                            ELSE FALSE
                        END AS completed
                FROM lecture l
                JOIN lecture_progress lp
                    ON  l.id        = lp.lecture_id
                    AND lp.student  = :username
                WHERE   l.course_id = :lectureId
                AND     l.deleted_at IS NULL
                ORDER BY l.lecture_order ASC
            """, nativeQuery = true)
    List<LectureProjection> findLectureDetailsByCourseIdAndUsername(UUID courseId, String username);

    @Query(value = """
                SELECT  COALESCE(MAX(l.order), 0) 
                FROM    lecture l
                WHERE   l.course_id = :courseId
            """, nativeQuery = true)
    Integer getMaxOrderByCourseId(UUID courseId);
}
