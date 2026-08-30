package com.pht.dev_edu.enrollment.scheduler;

import com.pht.dev_edu.common.constant.CronJobConstant;
import com.pht.dev_edu.common.service.DeleteProcessor;
import com.pht.dev_edu.enrollment.repo.CartItemRepository;
import com.pht.dev_edu.enrollment.repo.OrderItemRepository;
import com.pht.dev_edu.enrollment.repo.OrderRepository;
import com.pht.dev_edu.enrollment.repo.PaymentHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Scheduled background tasks for orders, payment sessions, and shopping cart maintenance.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class OrderScheduler {
    PaymentHistoryRepository paymentHistoryRepository;
    OrderRepository orderRepository;
    OrderItemRepository orderItemRepository;
    CartItemRepository cartItemRepository;
    DeleteProcessor deleteProcessor;

    public static final long EXPIRATION_TIME_IN_MINUTES = 15;
    private static final long EXPIRED_ORDER_DELAY_DAYS = 7;

    /**
     * Cleans up expired and canceled payment sessions and their corresponding order records older than 7 days.
     * Runs every hour.
     */
    @Transactional
    @Scheduled(fixedDelay = 60 * 60 * 1000)
    public void cleanCancelledPayments() {
        var cutoffTime = java.time.LocalDateTime.now().minusDays(EXPIRED_ORDER_DELAY_DAYS);

        deleteProcessor.executeCleanupJob(
                CronJobConstant.CLEAN_EXPIRED_PAYMENT_SESSIONS_JOB,
                () -> {
                    var deletedPaymentIds = paymentHistoryRepository.deleteByExpirationTimeBeforeAndStatuses(
                            cutoffTime,
                            java.util.List.of(
                                    com.pht.dev_edu.enrollment.dto.PaymentStatus.PENDING.name()
                            )
                    );

                    if (deletedPaymentIds.isEmpty()) {
                        return 0;
                    }

                    var deletedOrderIds = orderRepository.deleteInvalidOrders(deletedPaymentIds);
                    log.info("Deleted {} orders associated with expired payment sessions.", deletedOrderIds.size());

                    if (!deletedPaymentIds.isEmpty()) {
                        int deletedOrderItemsCount = orderItemRepository.deleteByOrderIdIn(deletedOrderIds);
                        log.info("Deleted {} order items associated with expired payment sessions.",
                                deletedOrderItemsCount);
                    }

                    return deletedPaymentIds.size();
                },
                "Deleted %d expired payment sessions that were cancelled.");
    }

    /**
     * Cleans up invalid items from shopping carts (e.g. deleted courses or already enrolled courses).
     * Runs every hour.
     */
    @Transactional
    @Scheduled(fixedDelay = 60 * 60 * 1000)
    public void cleanInvalidCartItem() {
        deleteProcessor.executeCleanupJob(
                CronJobConstant.CLEAN_INVALID_CART_ITEMS_JOB,
                () -> {
                    var deletedCartItemIds = cartItemRepository.deleteInvalidCourseCartItems();
                    return deletedCartItemIds.size();
                },
                "Deleted %d invalid cart items that were cancelled.");
    }

    /**
     * Cleans up unpaid pending orders that have exceeded the 15-minute checkout window.
     * Runs every 30 minutes.
     */
    @Transactional
    @Scheduled(fixedDelay = 30 * 60 * 1000)
    public void cleanExpiredOrders() {
        var cutoffTime = java.time.LocalDateTime.now().minusMinutes(EXPIRATION_TIME_IN_MINUTES);
        deleteProcessor.executeCleanupJob(
                CronJobConstant.CLEAN_EXPIRED_ORDERS_JOB,
                () -> {
                    var deletedOrderIds = orderRepository.deleteExpiredOrders(cutoffTime);
                    orderItemRepository.deleteByOrderIdIn(deletedOrderIds);
                    return deletedOrderIds.size();
                },
                "Deleted %d expired orders that were pending.");
    }
}
