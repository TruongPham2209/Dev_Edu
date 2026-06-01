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

    private static final long EXPIRED_ORDER_DELAY_DAYS = 7;
    private static final long INVALID_CART_ITEM_DELAY_DAYS = 3;

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
                                    com.pht.dev_edu.enrollment.dto.PaymentStatus.PENDING.name(),
                                    com.pht.dev_edu.enrollment.dto.PaymentStatus.FAILED.name(),
                                    com.pht.dev_edu.enrollment.dto.PaymentStatus.CANCELLED.name()
                            )
                    );

                    if (deletedPaymentIds.isEmpty()) {
                        return 0;
                    }

                    var deletedOrderIds = orderRepository.deleteInvalidOrders(deletedPaymentIds);
                    log.info("Deleted {} orders associated with expired payment sessions.", deletedOrderIds.size());

                    if (!deletedPaymentIds.isEmpty()) {
                        int deletedOrderItemsCount = orderItemRepository.deleteByOrderIdIn(deletedOrderIds);
                        log.info("Deleted {} order items associated with expired payment sessions.", deletedOrderItemsCount);
                    }

                    return deletedPaymentIds.size();
                },
                "Deleted %d expired payment sessions that were cancelled."
        );
    }

    @Transactional
    @Scheduled(fixedDelay = 60 * 60 * 1000)
    public void cleanInvalidCartItem() {
        deleteProcessor.executeCleanupJob(
                CronJobConstant.CLEAN_INVALID_CART_ITEMS_JOB,
                () -> {
                    var deletedCartItemIds = cartItemRepository.deleteInvalidCourseCartItems();
                    // TODO: if implement subscription, need to delete invalid subscription cart items as well
                    return deletedCartItemIds.size();
                },
                "Deleted %d invalid cart items that were cancelled."
        );
    }
}
