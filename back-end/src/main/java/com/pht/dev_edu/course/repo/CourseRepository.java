package com.pht.dev_edu.course.repo;

import com.pht.dev_edu.course.entity.CourseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CourseRepository extends JpaRepository<CourseEntity, UUID> {
}
