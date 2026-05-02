package com.pht.dev_edu.enrollment.service;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.security.AccessDeniedException;
import com.pht.dev_edu.common.util.PaymentUtils;
import com.pht.dev_edu.enrollment.dto.*;
import com.pht.dev_edu.enrollment.entity.OrderEntity;
import com.pht.dev_edu.enrollment.entity.OrderItemEntity;
import com.pht.dev_edu.enrollment.entity.PaymentHistoryEntity;
import com.pht.dev_edu.enrollment.mapper.OrderItemMapper;
import com.pht.dev_edu.enrollment.repo.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
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
    CourseDiscountRepository courseDiscountRepository;

    OrderItemMapper orderItemMapper;
    EnrollmentService enrollmentService;

    private static final int EXPIRATION_TIME_MINUTES = 15;

    @Override
    @Transactional
    public PurchaseDetailResponse processPurchase(String username, PurchaseRequest purchaseRequest) {
        BigDecimal totalAmount;
        String description = "";

        var now = LocalDateTime.now();
        var expirationTime = now.plusMinutes(EXPIRATION_TIME_MINUTES);

        UUID paymentId = UuidCreator.getTimeOrderedEpoch();
        PaymentHistoryEntity payment = PaymentHistoryEntity.builder()
                .id(paymentId)
                .paymentMethod(purchaseRequest.getPaymentMethod())
                .status(PaymentStatus.PENDING)
                .username(username)
                .transactionId(paymentId.toString())
                .expirationTime(expirationTime)
                .build();

        OrderEntity order = OrderEntity.builder()
                .id(paymentId)
                .username(username)
                .status(PaymentStatus.PENDING)
                .build();

        var purchaseDetail = PurchaseDetailResponse.builder()
                .paymentId(paymentId)
                .entityType(purchaseRequest.getEntityType())
                .build();

        switch (purchaseRequest.getEntityType()) {
            case COURSE -> {
                description = "Purchase courses: " + System.currentTimeMillis();
                var items = orderCourses(username, paymentId, purchaseRequest.getEntityIds());
                totalAmount = items.stream()
                        .filter(item -> !item.isRegistered())
                        .map(CourseItemResponse::getDiscountedPrice)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                purchaseDetail.setItems(Collections.singletonList(items));
                purchaseDetail.setTotalAmount(totalAmount);

                payment.setAmount(totalAmount);
                order.setTotalAmount(totalAmount);
            }
            case SUBSCRIPTION -> {
                log.warn("Subscription purchase not implemented yet");
                throw new UnsupportedOperationException("Subscription purchase not implemented yet");
            }
        }

        paymentHistoryRepository.save(payment);
        orderRepository.save(order);

        switch (purchaseRequest.getPaymentMethod()) {
            case VNPAY -> {
                var vnPayParams = PaymentUtils.createVnPayPaymentParams(
                        paymentId.toString(),
                        payment.getAmount(),
                        purchaseRequest.getIpAddress(),
                        description,
                        expirationTime
                );

                var paymentUrl = PaymentUtils.getPaymentUrl(vnPayParams);
                purchaseDetail.setPaymentUrl(paymentUrl);
                return purchaseDetail;
            }
            default -> {
                log.warn("Unsupported payment method: {}", purchaseRequest.getPaymentMethod());
                throw new UnsupportedOperationException("Unsupported payment method: " + purchaseRequest.getPaymentMethod());
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

                payment.setStatus(status);
                paymentHistoryRepository.save(payment);

                var order = orderRepository.findById(payment.getId())
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

                var items = orderItemRepository.findByOrderId(payment.getId());
                if (items.isEmpty()) {
                    log.warn("No order items found for VNPAY return: orderId={}", payment.getId());
                    return;
                }

                var entityType = items.getFirst().getEntityType();
                switch (entityType) {
                    case COURSE -> {
                        var username = payment.getUsername();
                        var courseIds = items.stream()
                                .map(OrderItemEntity::getEntityId)
                                .toList();
                        enrollmentService.enrollUserInCourse(username, courseIds, payment.getId());
                    }
                    case SUBSCRIPTION -> {
                        log.warn("Subscription return handling not implemented yet");
                    }
                }
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

    private List<CourseItemResponse> orderCourses(String username, UUID orderId, List<UUID> courseIds) {
        if (orderItemRepository.existsByUsernameAndItem(username, PurchaseEntityType.COURSE, courseIds)) {
            log.warn("User {} already has pending or completed order for courses: {}", username, courseIds);
            throw new BadRequestException("You already have a pending or completed order for some of these courses");
        }

        LocalDateTime now = LocalDateTime.now();
        var globalDiscount = courseDiscountRepository.getGlobalActiveDiscount(now)
                .orElse(BigDecimal.ZERO);
        var courseItems = courseDiscountRepository.findDiscountedCoursesForUser(username, courseIds, now)
                .stream()
                .map(c -> {
                    var discountPercentage = globalDiscount.max(c.getDiscountedPercentage());
                    var discountRate = discountPercentage
                            .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

                    var discountedPrice = c.getOriginalPrice()
                            .multiply(BigDecimal.ONE.subtract(discountRate))
                            .setScale(2, RoundingMode.HALF_UP);

                    var item = orderItemMapper.courseProjectionToCourseItem(c);
                    item.setDiscountedPrice(discountedPrice);

                    return item;
                })
                .toList();

        if (courseIds.size() != courseItems.size()) {
            log.warn("Some courses not found or not available for purchase: requested={}, found={}", courseIds, courseItems.stream().map(CourseItemResponse::getId).toList());
            throw new BadRequestException("Some courses not found or not available for purchase");
        }

        var orderItems = courseItems.stream()
                .filter(item -> !item.isRegistered())
                .map(c -> OrderItemEntity.builder()
                        .orderId(orderId)
                        .entityType(PurchaseEntityType.COURSE)
                        .entityId(c.getId())
                        .price(c.getDiscountedPrice())
                        .build())
                .toList();
        orderItemRepository.saveAll(orderItems);

        cartItemRepository.deleteByUsernameAndItemTypeAndItemIdIn(username, PurchaseEntityType.COURSE, courseIds);
        return courseItems;
    }
}
