package com.pht.dev_edu.enrollment.repo;

import com.pht.dev_edu.enrollment.dto.CourseOrderItemProjection;
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
                FROM "order" o
                JOIN order_item oi
                    ON o.id = oi.order_id
                WHERE   o.username      = :username
                AND     o.status        IN ('PENDING', 'COMPLETED')
                AND     oi.item_type    = :entityType
                AND     oi.item_id      IN :itemIds
            )
            """, nativeQuery = true)
    boolean existsByUsernameAndItem(String username, String entityType, List<UUID> itemIds);

    @Query(value = """
            SELECT  oi.id               AS id,
                    c.id                AS courseId,
                    c.title             AS title,
                    c.description       AS description,
                    c.thumbnail_url     AS thumbnailUrl,
                    c.price             AS originalPrice
            FROM order_item oi
            LEFT JOIN course c
                ON  oi.item_id      = c.id
                AND oi.item_type    = 'COURSE'
            WHERE oi.order_id IN :orderIds
            """, nativeQuery = true)
    List<CourseOrderItemProjection> getOrderItemsByOrderIds(List<UUID> orderIds);

    @Modifying
    int deleteByOrderIdIn(List<UUID> orderIds);
}