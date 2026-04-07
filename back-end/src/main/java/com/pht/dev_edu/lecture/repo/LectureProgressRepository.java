package com.pht.dev_edu.lecture.repo;

import com.pht.dev_edu.lecture.entity.LectureProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LectureProgressRepository extends JpaRepository<LectureProgressEntity, UUID> {
}
