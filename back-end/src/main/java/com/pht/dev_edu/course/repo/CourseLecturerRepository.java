package com.pht.dev_edu.course.repo;

import com.pht.dev_edu.course.entity.CourseLecturerEntity;
import com.pht.dev_edu.course.entity.CourseLecturerId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseLecturerRepository extends JpaRepository<CourseLecturerEntity, CourseLecturerId> {
}
