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
                AND     o.status        IN ('PROCESSING', 'COMPLETED')
                AND     oi.item_type    = :entityType
                AND     oi.item_id      IN :itemIds
            )
            """, nativeQuery = true)
    boolean existsByUsernameAndItems(String username, String entityType, List<UUID> itemIds);

    @Query(value = """
            SELECT  oi.id               AS id,
                    oi.order_id         AS orderId,
                    c.id                AS courseId,
                    c.title             AS title,
                    c.description       AS description,
                    c.thumbnail_url     AS thumbnailUrl,
                    oi.original_price   AS originalPrice,
                    oi.discounted_price AS discountedPrice
            FROM order_item oi
            LEFT JOIN course c
                ON  oi.item_type    = 'COURSE'
                AND oi.item_id      = c.id
            WHERE oi.order_id IN :orderIds
            """, nativeQuery = true)
    List<CourseOrderItemProjection> getOrderItemsByOrderIds(List<UUID> orderIds);

    @Modifying
    int deleteByOrderIdIn(List<UUID> orderIds);

    @Query(value = """
                    SELECT NOT EXISTS (
                        WITH filtered_order AS (
                            SELECT DISTINCT(order_id) AS order_id
                            FROM order_item
                            WHERE   item_id     IN :itemIds
                            AND     item_type   = 'COURSE'
                            AND     order_id    != :currentOrderId
                        )
                        SELECT 1
                        FROM "order" o
                        WHERE   o.id        IN (SELECT order_id FROM filtered_order)
                        AND     o.username  = :username
                        AND     o.status    IN ('PROCESSING', 'COMPLETED')
                    )
                    AND
                    NOT EXISTS (
                        SELECT 1
                        FROM enrollment e
                        WHERE   e.course_id         IN :itemIds
                        AND     e.student_username  = :username
                    );
            """, nativeQuery = true)
    boolean hasValidOrderItemsForPayment(List<UUID> itemIds, UUID currentOrderId, String username);
}