package com.pht.dev_edu.lecture.repo;

import com.pht.dev_edu.lecture.entity.LectureProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.UUID;

public interface LectureProgressRepository extends JpaRepository<LectureProgressEntity, UUID> {
    boolean existsByLectureIdAndStudent(UUID lectureId, String student);

    @Modifying
    void deleteByLectureId(UUID lectureId);
}
