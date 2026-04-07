package com.pht.dev_edu.assignment.repo;

import com.pht.dev_edu.assignment.entity.TrackingEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TrackingRepository extends JpaRepository<TrackingEntity, UUID> {
}
