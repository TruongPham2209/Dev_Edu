package com.pht.dev_edu.forum.repo;

import com.pht.dev_edu.forum.dto.PostInfoProjection;
import com.pht.dev_edu.forum.dto.PostStatus;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.UUID;

public interface PostQueryRepository {
    Page<PostInfoProjection> getPostedPosts(String username, PostStatus status, LocalDateTime lastUpdatedAt, UUID lastId, int limit);
}
