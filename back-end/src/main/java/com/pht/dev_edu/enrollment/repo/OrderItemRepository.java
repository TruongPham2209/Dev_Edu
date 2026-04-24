package com.pht.dev_edu.enrollment.repo;

import com.pht.dev_edu.enrollment.entity.OrderItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OrderItemRepository extends JpaRepository<OrderItemEntity, UUID> {
}