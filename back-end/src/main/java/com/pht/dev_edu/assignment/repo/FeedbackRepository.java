package com.pht.dev_edu.assignment.repo;

import com.pht.dev_edu.assignment.entity.FeedbackEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FeedbackRepository extends JpaRepository<FeedbackEntity, UUID> {
}
