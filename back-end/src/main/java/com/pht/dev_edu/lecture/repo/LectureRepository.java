package com.pht.dev_edu.lecture.repo;

import com.pht.dev_edu.lecture.dto.LectureProjection;
import com.pht.dev_edu.lecture.entity.LectureEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LectureRepository extends JpaRepository<LectureEntity, UUID> {
    @Query(value = """
                SELECT  l.id                AS id,
                        l.course_id         AS courseId,
                        l.title             AS title,
                        l.summary           AS summary,
                        l.content           AS content,
                        l.video_object_key  AS videoObjectKey,
                        l.lecture_order     AS lectureOrder,
                        l.uploaded_at       AS uploadedAt,
                        CASE
                            WHEN lp.lecture_id IS NOT NULL THEN TRUE
                            ELSE FALSE
                        END AS completed
                FROM lecture l
                LEFT JOIN lecture_progress lp
                    ON  l.id        = lp.lecture_id
                    AND lp.student  = :username
                WHERE   l.id            = :lectureId
                AND     l.deleted_at    IS NULL
            """, nativeQuery = true)
    Optional<LectureProjection> findLectureDetailByIdAndUsername(UUID lectureId, String username);

    @Query(value = """
                SELECT NOT EXISTS (
                    SELECT 1
                    FROM lecture l
                    LEFT JOIN lecture_progress lp
                        ON  l.id        = lp.lecture_id
                        AND lp.student  = :username
                    WHERE   l.course_id     = :courseId
                    AND     l.deleted_at    IS NULL
                    AND     l.lecture_order < :lectureOrder
                    AND     lp.student      IS NULL
                )
            """, nativeQuery = true)
    boolean hasCompletedAllPreviousLectures(UUID courseId, int lectureOrder, String username);

    @Query(value = """
                SELECT  l.id                    AS id,
                        l.course_id             AS courseId,
                        l.title                 AS title,
                        l.summary               AS summary,
                        CASE
                            WHEN lp.lecture_id IS NOT NULL THEN l.content
                        END                     AS content,
                        CASE
                            WHEN lp.lecture_id IS NOT NULL THEN l.video_object_key
                        END                     AS video_object_key,
                        l.lecture_order         AS lectureOrder,
                        l.uploaded_at           AS uploadedAt,
                        CASE
                            WHEN lp.lecture_id IS NOT NULL THEN TRUE
                            ELSE FALSE
                        END                     AS completed
                FROM lecture l
                LEFT JOIN lecture_progress lp
                    ON  l.id        = lp.lecture_id
                    AND lp.student  = :username
                WHERE   l.course_id     = :courseId
                AND     l.deleted_at    IS NULL
                ORDER BY l.lecture_order
            """, nativeQuery = true)
    List<LectureProjection> findLectureDetailsByCourseIdAndUsername(UUID courseId, String username);

    @Query(value = """
                SELECT  l.id                    AS id,
                        l.course_id             AS courseId,
                        l.title                 AS title,
                        l.summary               AS summary,
                        l.content               AS content,
                        l.video_object_key      AS video_object_key,
                        l.lecture_order         AS lectureOrder,
                        l.uploaded_at           AS uploadedAt,
                        FALSE                   AS completed
                FROM lecture l
                WHERE   l.course_id     = :courseId
                AND     l.deleted_at    IS NULL
                ORDER BY l.lecture_order
            """, nativeQuery = true)
    List<LectureProjection> findLectureDetailsByCourseId(UUID courseId);

    @Query(value = """
                SELECT  COALESCE(MAX(l.lecture_order), 0)
                FROM    lecture l
                WHERE   l.course_id = :courseId
            """, nativeQuery = true)
    Integer getMaxOrderByCourseId(UUID courseId);

    @Modifying
    @Query(value = """
                UPDATE lecture
                SET duration = :duration
                WHERE id = :lectureId
            """, nativeQuery = true)
    void updateLectureVideoDuration(UUID lectureId, Integer duration);

    @Query("""
                SELECT l.id
                FROM LectureEntity l
                WHERE   l.deletedAt IS NOT NULL
                AND     l.deletedAt < :cutoffTime
            """)
    List<UUID> findDeletedIdsBeforeCutoffTime(java.time.LocalDateTime cutoffTime);
}
