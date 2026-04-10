package com.pht.dev_edu.tracking.repo;

import com.pht.dev_edu.tracking.entity.LogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LogRepository extends JpaRepository<LogEntity, UUID> {
}
