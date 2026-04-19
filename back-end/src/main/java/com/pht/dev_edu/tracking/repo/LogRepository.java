package com.pht.dev_edu.tracking.repo;

import com.pht.dev_edu.tracking.entity.LogTrackingEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LogRepository extends JpaRepository<LogTrackingEntity, UUID> {
}
