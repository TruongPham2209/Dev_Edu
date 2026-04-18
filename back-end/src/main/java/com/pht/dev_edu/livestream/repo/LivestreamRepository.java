package com.pht.dev_edu.livestream.repo;

import com.pht.dev_edu.livestream.entity.LivestreamEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LivestreamRepository extends JpaRepository<LivestreamEntity, UUID> {
}
