package com.pht.dev_edu.enrollment.repo;

import com.pht.dev_edu.enrollment.entity.CartItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CartItemRepository extends JpaRepository<CartItemEntity, UUID> {
}