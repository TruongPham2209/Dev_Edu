package com.pht.dev_edu.enrollment.repo;

import com.pht.dev_edu.enrollment.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<OrderEntity, UUID> {
    @Modifying
    @Query(value = """
            DELETE FROM order
            WHERE id IN :paymentIds
            RETURNING id
            """, nativeQuery = true)
    List<UUID> deleteInvalidOrders(List<UUID> paymentIds);
}