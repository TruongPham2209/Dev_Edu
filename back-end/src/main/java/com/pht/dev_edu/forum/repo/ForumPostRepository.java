package com.pht.dev_edu.forum.repo;

import com.pht.dev_edu.forum.entity.ForumPostEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ForumPostRepository extends JpaRepository<ForumPostEntity, UUID> {
}
