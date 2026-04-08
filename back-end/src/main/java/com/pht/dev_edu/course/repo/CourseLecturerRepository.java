package com.pht.dev_edu.course.repo;

import com.pht.dev_edu.course.entity.CourseLecturerEntity;
import com.pht.dev_edu.course.entity.CourseLecturerId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.List;
import java.util.UUID;

public interface CourseLecturerRepository extends JpaRepository<CourseLecturerEntity, CourseLecturerId> {
    @Modifying
    void deleteByIdCourseId(UUID courseId);

    List<CourseLecturerEntity> findAllByIdCourseId(UUID courseId);
}
