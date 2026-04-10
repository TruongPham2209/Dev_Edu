package com.pht.dev_edu.lecture.repo;

import com.pht.dev_edu.lecture.entity.LectureMaterialEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LectureMaterialRepository extends JpaRepository<LectureMaterialEntity, UUID> {
    List<LectureMaterialEntity> findAllByLectureIdAndDeletedAtIsNull(UUID lectureId);
}
