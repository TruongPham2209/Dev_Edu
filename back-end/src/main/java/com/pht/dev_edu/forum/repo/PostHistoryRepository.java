package com.pht.dev_edu.forum.repo;

import com.pht.dev_edu.forum.entity.PostHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PostHistoryRepository extends JpaRepository<PostHistoryEntity, UUID> {
}
