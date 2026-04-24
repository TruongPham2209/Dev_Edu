package com.pht.dev_edu.enrollment.repo;

import com.pht.dev_edu.enrollment.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OrderRepository extends JpaRepository<OrderEntity, UUID> {
}