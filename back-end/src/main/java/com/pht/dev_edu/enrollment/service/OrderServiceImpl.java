package com.pht.dev_edu.enrollment.service;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.course.repo.CourseDiscountRepository;
import com.pht.dev_edu.enrollment.dto.*;
import com.pht.dev_edu.enrollment.entity.OrderEntity;
import com.pht.dev_edu.enrollment.entity.OrderItemEntity;
import com.pht.dev_edu.enrollment.mapper.OrderItemMapper;
import com.pht.dev_edu.enrollment.repo.OrderItemRepository;
import com.pht.dev_edu.enrollment.repo.OrderRepository;
import com.pht.dev_edu.enrollment.scheduler.OrderScheduler;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class OrderServiceImpl implements OrderService {
    CourseDiscountRepository courseDiscountRepository;
    OrderRepository orderRepository;
    OrderItemRepository orderItemRepository;

    OrderItemMapper orderItemMapper;

    @Override
    @Transactional
    public CheckoutDetailResponse checkout(String username, CheckoutRequest checkoutRequest) {
        var order = OrderEntity.builder()
                .id(UuidCreator.getTimeOrderedEpoch())
                .status(PaymentStatus.PENDING)
                .username(username)
                .build();

        if (checkoutRequest.getEntityType() != PurchaseEntityType.COURSE) {
            log.warn("Checkout request is not of type COURSE");
            throw new BadRequestException("Checkout request is not of type COURSE");
        }

        List<CourseItemResponse> orderItems = checkoutCourses(username, order.getId(), checkoutRequest.getEntityIds());
        var totalAmount = orderItems.stream()
                .map(CourseItemResponse::getDiscountedPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalAmount(totalAmount);
        orderRepository.save(order);

        return CheckoutDetailResponse.builder()
                .items(orderItems)
                .orderId(order.getId())
                .totalAmount(order.getTotalAmount())
                .entityType(checkoutRequest.getEntityType())
                .build();
    }

    @Override
    @Transactional
    public CheckoutDetailResponse getOrderDetail(String username, UUID orderId) {
        var order = orderRepository.findByIdAndUsername(orderId, username).orElseThrow(
                () -> new DataNotFoundException("Order not found.")
        );

        if (order.getStatus() != PaymentStatus.PENDING) {
            log.warn("Checkout request is not of type PENDING");
            throw new BadRequestException("Order not found.");
        }

        // After 15', if user wasn't checkout, get detail rejected
        if (order.getCreatedAt().minusMinutes(OrderScheduler.EXPIRATION_TIME_IN_MINUTES).isAfter(LocalDateTime.now())) {
            log.warn("Order has expired.");
            throw new DataNotFoundException("Order has expired.");
        }

        // TODO: update if implements another entityType
        var projections = orderItemRepository.getOrderItemsByOrderIds(List.of(order.getId()));
        if (projections.isEmpty()) {
            throw new DataNotFoundException("Order not found.");
        }
        var items = projections.stream()
                .map(orderItemMapper::courseProjectionToCourseItem)
                .toList();

        return CheckoutDetailResponse.builder()
                .items(items)
                .orderId(order.getId())
                .totalAmount(order.getTotalAmount())
                .entityType(PurchaseEntityType.COURSE)
                .build();
    }

    @Override
    @Transactional
    public void cancelOrder(String username, UUID orderId) {
        var orderOpt = orderRepository.findByIdAndUsername(orderId, username);
        if (orderOpt.isEmpty()) {
            log.warn("Order not found.");
            return;
        }

        var order = orderOpt.get();
        if (order.getStatus() != PaymentStatus.PENDING) {
            log.warn("Order is not of type PENDING");
            return;
        }

        order.setStatus(PaymentStatus.CANCELLED);
        orderRepository.save(order);
    }

    private List<CourseItemResponse> checkoutCourses(String username, UUID orderId, List<UUID> courseIds) {
        if (orderItemRepository.existsByUsernameAndItems(username, PurchaseEntityType.COURSE.name(), courseIds)) {
            log.warn("User {} already has processing or completed order for courses: {}", username, courseIds);
            throw new BadRequestException("You already have a pending or completed order for some of these courses");
        }

        var courseItems = getCourseItemDetails(username, courseIds);

        if (courseItems.stream().anyMatch(CourseItemResponse::isRegistered)) {
            log.error("Course {} has already been registered", courseIds);
            throw new BadRequestException("Course has already been registered");
        }

        if (courseIds.size() != courseItems.size()) {
            log.warn("Some courses not found or not available for purchase: requested={}, found={}", courseIds, courseItems.stream().map(CourseItemResponse::getId).toList());
            throw new BadRequestException("Some courses not found or not available for purchase");
        }

        var orderItems = courseItems.stream()
                .filter(item -> !item.isRegistered())
                .map(c -> OrderItemEntity.builder()
                        .orderId(orderId)
                        .itemType(PurchaseEntityType.COURSE)
                        .itemId(c.getId())
                        .originalPrice(c.getOriginalPrice())
                        .discountedPrice(c.getDiscountedPrice())
                        .build())
                .toList();
        orderItemRepository.saveAll(orderItems);

        return courseItems;
    }

    private List<CourseItemResponse> getCourseItemDetails(String username, List<UUID> courseIds) {
        LocalDateTime now = LocalDateTime.now();
        var globalDiscountEntity = courseDiscountRepository.getGlobalActiveDiscount(now)
                .orElse(null);
        var globalDiscount = globalDiscountEntity == null
                ? BigDecimal.ZERO
                : globalDiscountEntity.getDiscountPercentage();

        return courseDiscountRepository.findDiscountedCoursesForUser(username, courseIds, now)
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
                }).toList();
    }
}
