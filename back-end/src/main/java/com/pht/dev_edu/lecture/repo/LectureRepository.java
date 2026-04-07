package com.pht.dev_edu.lecture.repo;

import com.pht.dev_edu.lecture.entity.LectureEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LectureRepository extends JpaRepository<LectureEntity, UUID> {
}
