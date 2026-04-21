package com.pht.dev_edu.lecture.repo;

import com.pht.dev_edu.lecture.entity.LectureMaterialEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface LectureMaterialRepository extends JpaRepository<LectureMaterialEntity, UUID> {
    List<LectureMaterialEntity> findAllByLectureIdAndDeletedAtIsNullOrderByUploadedAtDesc(UUID lectureId);

    @Modifying
    @Query(value = """
            DELETE FROM lecture_material
            WHERE deleted_at < :cutoffTime
            RETURNING file_object_key
            """, nativeQuery = true)
    List<String> deleteMaterialBeforeCutoffTimeThenReturnObjectKey(LocalDateTime cutoffTime);

    @Modifying
    @Query(value = """
                    DELETE FROM lecture_material
                    WHERE lecture_id = :lectureId
                    RETURNING file_object_key
            """, nativeQuery = true)
    List<String> deleteMaterialsByLectureIdThenReturnObjectKey(UUID lectureId);
}
