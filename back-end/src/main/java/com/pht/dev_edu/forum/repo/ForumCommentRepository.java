package com.pht.dev_edu.forum.repo;

import com.pht.dev_edu.forum.entity.ForumCommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ForumCommentRepository extends JpaRepository<ForumCommentEntity, UUID> {
}
