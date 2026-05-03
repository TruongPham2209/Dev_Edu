package com.pht.dev_edu.enrollment.repo;

import com.pht.dev_edu.enrollment.dto.PurchaseEntityType;
import com.pht.dev_edu.enrollment.entity.OrderItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface OrderItemRepository extends JpaRepository<OrderItemEntity, UUID> {
    List<OrderItemEntity> findByOrderId(UUID orderId);

    @Query(value = """
            SELECT EXISTS (
                SELECT 1
                FROM order o
                JOIN order_item oi
                    ON o.id = oi.order_id
                WHERE   o.username      = :username
                AND     o.status        IN ('PENDING', 'COMPLETED')
                AND     oi.item_type    = :entityType
                AND     oi.item_id      IN :itemIds
            )
            """, nativeQuery = true)
    boolean existsByUsernameAndItem(String username, PurchaseEntityType entityType, List<UUID> itemIds);

    @Modifying
    int deleteByOrderIdIn(List<UUID> orderIds);
}