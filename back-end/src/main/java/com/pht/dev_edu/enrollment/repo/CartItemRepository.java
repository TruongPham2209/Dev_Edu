package com.pht.dev_edu.enrollment.repo;

import com.pht.dev_edu.enrollment.dto.PurchaseEntityType;
import com.pht.dev_edu.enrollment.entity.CartItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.List;
import java.util.UUID;

public interface CartItemRepository extends JpaRepository<CartItemEntity, UUID> {
    @Modifying
    void deleteByUsernameAndItemTypeAndItemIdIn(String username, PurchaseEntityType itemType, List<UUID> itemId);
}