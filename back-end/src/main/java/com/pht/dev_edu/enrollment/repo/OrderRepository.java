package com.pht.dev_edu.enrollment.repo;

import com.pht.dev_edu.enrollment.entity.OrderEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<OrderEntity, UUID> {
    @Modifying
    @Query(value = """
            DELETE FROM "order"
            WHERE id IN :paymentIds
            RETURNING id
            """, nativeQuery = true)
    List<UUID> deleteInvalidOrders(List<UUID> paymentIds);

    @Query(value = """
            SELECT *
            FROM "order"
            WHERE   username            = :username
            AND     (created_at, id)    < (:lastCreatedAt, :lastId)
            AND     status              = :status
            ORDER BY created_at DESC, id DESC
            """, countQuery = """
            SELECT COUNT(id)
            FROM "order"
            WHERE   username            = :username
            AND     status              = :status
            """
            , nativeQuery = true)
    Page<OrderEntity> findByUsernameAndStatus(String username, String status, LocalDateTime lastCreatedAt, UUID lastId, Pageable pageable);
}