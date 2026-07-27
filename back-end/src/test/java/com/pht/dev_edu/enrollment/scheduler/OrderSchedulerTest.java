package com.pht.dev_edu.enrollment.scheduler;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/*
 * <analysis>
 * OrderScheduler
 * - cleanCancelledPayments()
 *   - paths:
 *       [P1: executes cleanup job on deleteProcessor for expired payment sessions]
 *   - planned tests:
 *       [shouldExecuteCleanupJobForCancelledPayments -> P1]
 *
 * - cleanInvalidCartItem()
 *   - paths:
 *       [P1: executes cleanup job on deleteProcessor for invalid cart items]
 *   - planned tests:
 *       [shouldExecuteCleanupJobForInvalidCartItems -> P1]
 *
 * - cleanExpiredOrders()
 *   - paths:
 *       [P1: executes cleanup job on deleteProcessor for expired orders]
 *   - planned tests:
 *       [shouldExecuteCleanupJobForExpiredOrders -> P1]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for OrderScheduler
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify cleanup task execution in OrderScheduler.
 *
 * Test Scope
 * ----------
 * - cleanCancelledPayments()
 * - cleanInvalidCartItem()
 * - cleanExpiredOrders()
 *
 * Covered Scenarios
 * -----------------
 * ✓ Invoking deleteProcessor cleanup jobs for payments, cart items, and expired orders
 *
 * Mocked Dependencies
 * -------------------
 * - PaymentHistoryRepository
 * - OrderRepository
 * - OrderItemRepository
 * - CartItemRepository
 * - DeleteProcessor
 */

import com.pht.dev_edu.common.constant.CronJobConstant;
import com.pht.dev_edu.common.service.DeleteProcessor;
import com.pht.dev_edu.enrollment.repo.CartItemRepository;
import com.pht.dev_edu.enrollment.repo.OrderItemRepository;
import com.pht.dev_edu.enrollment.repo.OrderRepository;
import com.pht.dev_edu.enrollment.repo.PaymentHistoryRepository;

@ExtendWith(MockitoExtension.class)
class OrderSchedulerTest {

    @Mock
    private PaymentHistoryRepository paymentHistoryRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private DeleteProcessor deleteProcessor;

    @InjectMocks
    private OrderScheduler orderScheduler;

    @Test
    @DisplayName("cleanCancelledPayments - should execute cleanup job for cancelled payments")
    void shouldExecuteCleanupJobForCancelledPayments() {
        // Act
        orderScheduler.cleanCancelledPayments();

        // Verify
        verify(deleteProcessor).executeCleanupJob(
                eq(CronJobConstant.CLEAN_EXPIRED_PAYMENT_SESSIONS_JOB),
                any(),
                eq("Deleted %d expired payment sessions that were cancelled."));
    }

    @Test
    @DisplayName("cleanInvalidCartItem - should execute cleanup job for invalid cart items")
    void shouldExecuteCleanupJobForInvalidCartItems() {
        // Act
        orderScheduler.cleanInvalidCartItem();

        // Verify
        verify(deleteProcessor).executeCleanupJob(
                eq(CronJobConstant.CLEAN_INVALID_CART_ITEMS_JOB),
                any(),
                eq("Deleted %d invalid cart items that were cancelled."));
    }

    @Test
    @DisplayName("cleanExpiredOrders - should execute cleanup job for expired orders")
    void shouldExecuteCleanupJobForExpiredOrders() {
        // Act
        orderScheduler.cleanExpiredOrders();

        // Verify
        verify(deleteProcessor).executeCleanupJob(
                eq(CronJobConstant.CLEAN_EXPIRED_ORDERS_JOB),
                any(),
                eq("Deleted %d expired orders that were pending."));
    }
}
