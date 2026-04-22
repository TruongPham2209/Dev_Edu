package com.pht.dev_edu.forum.repo;

import com.pht.dev_edu.forum.entity.PostEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PostRepository extends JpaRepository<PostEntity, UUID> {
    int deleteByDeletedAtIsBefore(java.time.LocalDateTime cutoff);
}
