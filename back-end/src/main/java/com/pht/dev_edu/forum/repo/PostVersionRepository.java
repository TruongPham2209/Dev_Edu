package com.pht.dev_edu.forum.repo;

import com.pht.dev_edu.forum.entity.PostVersionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PostVersionRepository extends JpaRepository<PostVersionEntity, UUID> {
}
