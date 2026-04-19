package com.pht.dev_edu.tracking.repo;

import com.pht.dev_edu.tracking.entity.LogRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LogRequestRepository extends JpaRepository<LogRequestEntity, UUID> {
}