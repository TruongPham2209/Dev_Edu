package com.pht.dev_edu.enrollment.service;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.exception.security.AccessDeniedException;
import com.pht.dev_edu.common.util.PaymentUtils;
import com.pht.dev_edu.enrollment.dto.*;
import com.pht.dev_edu.enrollment.entity.OrderItemEntity;
import com.pht.dev_edu.enrollment.entity.PaymentHistoryEntity;
import com.pht.dev_edu.enrollment.repo.CartItemRepository;
import com.pht.dev_edu.enrollment.repo.OrderItemRepository;
import com.pht.dev_edu.enrollment.repo.OrderRepository;
import com.pht.dev_edu.enrollment.repo.PaymentHistoryRepository;
import com.pht.dev_edu.enrollment.scheduler.OrderScheduler;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentServiceImpl implements PaymentService {
    CartItemRepository cartItemRepository;
    OrderRepository orderRepository;
    OrderItemRepository orderItemRepository;
    PaymentHistoryRepository paymentHistoryRepository;

    EnrollmentService enrollmentService;

    @Override
    @Transactional
    public PaymentInfoResponse processPurchase(String username, PaymentRequest paymentRequest) {
        String description = "";

        var order = orderRepository.findByIdAndUsername(paymentRequest.getOrderId(), username)
                .orElseThrow(() -> new BadRequestException("Order Not Found"));

        if (order.getStatus() != PaymentStatus.PENDING) {
            log.error("Cannot process purchase, order has been pending");
            throw new BadRequestException("Order Not Found");
        }

        // After 15', if user wasn't checkout, get detail rejected
        if (order.getCreatedAt().minusMinutes(OrderScheduler.EXPIRATION_TIME_IN_MINUTES).isAfter(LocalDateTime.now())) {
            log.warn("Order has expired.");
            throw new DataNotFoundException("Order has expired.");
        }

        var items = orderItemRepository.findByOrderId(paymentRequest.getOrderId());
        if (items.isEmpty()) {
            log.error("Cannot process purchase, order has been pending");
            throw new BadRequestException("Order Not Found");
        }

        var entityType = items.getFirst().getItemType();
        var itemIds = items.stream().map(OrderItemEntity::getItemId).toList();
        if (entityType == PurchaseEntityType.COURSE) {
            boolean isEligibleForPayment = orderItemRepository.hasValidOrderItemsForPayment(itemIds, order.getId(), username);
            if (!isEligibleForPayment) {
                log.error("Cannot process purchase, order has been pending");
                throw new BadRequestException("Cannot process payment");
            }
        }

        var now = LocalDateTime.now();
        var expirationTime = now.plusMinutes(OrderScheduler.EXPIRATION_TIME_IN_MINUTES);

        UUID paymentId = UuidCreator.getTimeOrderedEpoch();
        PaymentHistoryEntity payment = PaymentHistoryEntity.builder()
                .id(paymentId)
                .paymentMethod(paymentRequest.getPaymentMethod())
                .status(PaymentStatus.PENDING)
                .amount(order.getTotalAmount())
                .username(username)
                .orderId(order.getId())
                .transactionId(paymentId.toString())
                .expirationTime(expirationTime)
                .build();

        order.setStatus(PaymentStatus.PROCESSING);

        var purchaseDetail = PaymentInfoResponse.builder()
                .paymentId(paymentId)
                .orderId(order.getId())
                .totalAmount(order.getTotalAmount())
                .entityType(entityType)
                .build();

        switch (entityType) {
            case COURSE -> {
                description = "Purchase courses: " + System.currentTimeMillis();
            }
            case SUBSCRIPTION -> {
                log.warn("Subscription purchase not implemented yet");
                throw new UnsupportedOperationException("Subscription purchase not implemented yet");
            }
        }

        if (payment.getAmount().compareTo(BigDecimal.ZERO) == 0) {
            payment.setPaymentTime(now);
            payment.setStatus(PaymentStatus.COMPLETED);
            order.setStatus(PaymentStatus.COMPLETED);

            paymentHistoryRepository.save(payment);
            orderRepository.save(order);

            // TODO: remove from cart

            if (entityType == PurchaseEntityType.COURSE) {
                cartItemRepository.deleteByUsernameAndItemTypeAndItemIdIn(username, PurchaseEntityType.COURSE, itemIds);
                enrollmentService.enrollUserInCourse(username, itemIds, order.getId());
            }

            return purchaseDetail;
        }

        paymentHistoryRepository.save(payment);
        orderRepository.save(order);

        if (entityType == PurchaseEntityType.COURSE) {
            log.info("Deleting course items in cart: {}", items);
            cartItemRepository.deleteByUsernameAndItemTypeAndItemIdIn(username, PurchaseEntityType.COURSE, itemIds);
        }

        switch (paymentRequest.getPaymentMethod()) {
            case VNPAY -> {
                var vnPayParams = PaymentUtils.createVnPayPaymentParams(
                        paymentId.toString(),
                        payment.getAmount(),
                        paymentRequest.getIpAddress(),
                        description,
                        expirationTime
                );

                var paymentUrl = PaymentUtils.getPaymentUrl(vnPayParams);
                purchaseDetail.setPaymentUrl(paymentUrl);
                return purchaseDetail;
            }
            default -> {
                log.warn("Unsupported payment method: {}", paymentRequest.getPaymentMethod());
                throw new UnsupportedOperationException("Unsupported payment method: " + paymentRequest.getPaymentMethod());
            }
        }

    }

    @Override
    @Transactional
    public void handlePaymentReturn(PaymentMethod method, String txnRef, String responseCode) {
        switch (method) {
            case VNPAY -> {
                UUID paymentId = UUID.fromString(txnRef);
                PaymentStatus status = "00".equals(responseCode) ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;
                log.info("Handling VNPAY return for paymentId={}, responseCode={}, interpretedStatus={}", paymentId, responseCode, status);

                var payment = paymentHistoryRepository.findById(paymentId)
                        .orElse(null);
                if (payment == null) {
                    log.warn("Payment not found for VNPAY return: paymentId={}", paymentId);
                    // TODO: send to kafka topic for manual review
                    return;
                }

                payment.setPaymentTime(LocalDateTime.now());
                payment.setStatus(status);
                paymentHistoryRepository.save(payment);

                var order = orderRepository.findById(payment.getOrderId())
                        .orElse(null);
                if (order == null) {
                    log.warn("Order not found for VNPAY return: orderId={}", payment.getId());
                } else {
                    order.setStatus(status);
                    orderRepository.save(order);
                }

                if (status != PaymentStatus.COMPLETED) {
                    log.info("Payment not successful, skipping enrollment: paymentId={}, status={}", payment.getId(), status);
                    return;
                }

                confirmOrder(paymentId, payment.getUsername());
            }
            default -> {
                log.warn("Unsupported payment method in return handling: {}", method);
                throw new UnsupportedOperationException("Unsupported payment method in return handling: " + method);
            }
        }
    }

    @Override
    @Transactional
    public void cancelPayment(String username, UUID paymentId) {
        var payment = paymentHistoryRepository.findById(paymentId)
                .orElse(null);
        if (payment == null) {
            log.warn("Payment not found for cancellation: paymentId={}", paymentId);
            return;
        }

        if (!payment.getUsername().equals(username)) {
            log.error("User {} attempted to cancel payment {} which belongs to {}", username, paymentId, payment.getUsername());
            throw new AccessDeniedException("User does not have permission to cancel this payment");
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            log.error("Payment cannot be cancelled because it is not pending: paymentId={}, status={}", paymentId, payment.getStatus());
            throw new BadRequestException("Only pending payments can be cancelled");
        }

        payment.setStatus(PaymentStatus.CANCELLED);
        paymentHistoryRepository.save(payment);

        var order = orderRepository.findById(paymentId)
                .orElse(null);
        if (order != null) {
            order.setStatus(PaymentStatus.CANCELLED);
            orderRepository.save(order);
        }

        // TODO: call payment gateway API to cancel payment if necessary (production)
    }

    private void confirmOrder(UUID orderId, String username) {
        var items = orderItemRepository.findByOrderId(orderId);
        if (items.isEmpty()) {
            log.warn("No order items found for VNPAY return: orderId={}", orderId);
            return;
        }

        var entityType = items.getFirst().getItemType();
        switch (entityType) {
            case COURSE -> {
                var courseIds = items.stream()
                        .map(OrderItemEntity::getItemId)
                        .toList();
                enrollmentService.enrollUserInCourse(username, courseIds, orderId);
            }
            case SUBSCRIPTION -> {
                log.warn("Subscription return handling not implemented yet");
            }
        }
    }
}
