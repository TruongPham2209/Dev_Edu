package com.pht.dev_edu.tracking.repo;

import com.pht.dev_edu.tracking.entity.MailTrackingEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MailTrackingRepository extends JpaRepository<MailTrackingEntity, UUID> {
}