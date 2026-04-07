package com.pht.dev_edu.lecture.repo;

import com.pht.dev_edu.lecture.entity.LectureCommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LectureCommentRepository extends JpaRepository<LectureCommentEntity, UUID> {
}
