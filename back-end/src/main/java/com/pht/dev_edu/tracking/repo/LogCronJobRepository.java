package com.pht.dev_edu.tracking.repo;

import com.pht.dev_edu.tracking.entity.LogCronJobEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LogCronJobRepository extends JpaRepository<LogCronJobEntity, UUID> {
}