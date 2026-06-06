package com.pht.dev_edu.enrollment.service;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.TimeStampCursor;
import com.pht.dev_edu.common.util.PagingUtils;
import com.pht.dev_edu.enrollment.dto.*;
import com.pht.dev_edu.enrollment.entity.OrderEntity;
import com.pht.dev_edu.enrollment.repo.*;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

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
    CartItemRepository cartItemRepository;
    EnrollmentRepository enrollmentRepository;
    OrderRepository orderRepository;
    OrderItemRepository orderItemRepository;

    @Override
    @Transactional
    public void addCourseToCart(String username, UUID courseId) {
        if (enrollmentRepository.existsByStudentUsernameAndCourseId(username, courseId)) {
            log.warn("User {} already enrolled in course {}, skipping add to cart", username, courseId);
            return;
        }

        UUID id = UuidCreator.getTimeOrderedEpoch();
        cartItemRepository.insertCartItemWithoutConstraintCheck(
                id,
                username,
                PurchaseEntityType.COURSE.name(),
                courseId
        );
    }

    @Override
    @Transactional
    public void removeCourseFromCart(String username, UUID courseId) {
        cartItemRepository.deleteByUsernameAndItemTypeAndItemIdIn(
                username,
                PurchaseEntityType.COURSE,
                List.of(courseId)
        );
    }

    @Override
    public CustomPaging<CourseItemDetailResponse> getCoursesInCart(String username, String nextCursor) {
        var pageable = PageRequest.of(0, 11);
        var timeCursor = resolveTimeStampCursor(nextCursor);

        var globalDiscountEntity = courseDiscountRepository.getGlobalActiveDiscount(LocalDateTime.now()).orElse(null);
        var globalDiscountPercentage = globalDiscountEntity == null
                ? BigDecimal.ZERO
                : globalDiscountEntity.getDiscountPercentage();
        var cartItemPage = cartItemRepository.findCoursesInCartByStudentUsernameAndCursor(username, timeCursor.getId(), timeCursor.getTimeStamp(), pageable);
        return PagingUtils.getPagedWithCursor(
                cartItemPage,
                ci -> {
                    var discountPercentage = globalDiscountPercentage.max(ci.getDiscountPercentage() != null ? ci.getDiscountPercentage() : BigDecimal.ZERO);
                    var discountedPrice = discountPercentage.compareTo(BigDecimal.ZERO) == 0
                            ? ci.getOriginalPrice()
                            : ci.getOriginalPrice()
                              .multiply(BigDecimal.ONE.subtract(
                                      discountPercentage.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)
                              ))
                              .setScale(2, RoundingMode.HALF_UP);

                    return CourseItemDetailResponse.builder()
                            .id(ci.getId())
                            .courseId(ci.getCourseId())
                            .title(ci.getCourseTitle())
                            .description(ci.getCourseDescription())
                            .thumbnailUrl(ci.getCourseThumbnailUrl())
                            .originalPrice(ci.getOriginalPrice())
                            .discountedPrice(discountedPrice)
                            .build();
                },
                CourseDiscountProjection::getCreatedAt,
                CourseDiscountProjection::getId,
                pageable.getPageSize() - 1
        );
    }

    @Override
    public CustomPaging<OrderDetailResponse> getOrderHistory(String username, PaymentStatus paymentStatus, String nextCursor) {
        var pageable = PageRequest.of(0, 11);
        var timeCursor = resolveTimeStampCursor(nextCursor);

        var orderPage = orderRepository.findByUsernameAndStatus(
                username,
                paymentStatus.name(),
                timeCursor.getTimeStamp(),
                timeCursor.getId(),
                pageable
        );

        var orderPaged = PagingUtils.getPagedWithCursor(
                orderPage,
                oe -> OrderDetailResponse.builder()
                        .id(oe.getId())
                        .totalAmount(oe.getTotalAmount())
                        .status(oe.getStatus())
                        .createdAt(oe.getCreatedAt())
                        .build(),
                OrderEntity::getCreatedAt,
                OrderEntity::getId,
                pageable.getPageSize() - 1
        );

        var orderIds = orderPage.getContent().stream()
                .limit(pageable.getPageSize() - 1)
                .map(OrderEntity::getId)
                .toList();

        var items = orderItemRepository.getOrderItemsByOrderIds(orderIds).stream()
                .collect(java.util.stream.Collectors.groupingBy(CourseOrderItemProjection::getOrderId));

        orderPaged.setContents(
                orderPaged.getContents().stream()
                        .peek(order -> {
                            var itemProjections = items.getOrDefault(order.getId(), List.of());
                            var orderItems = itemProjections.stream()
                                    .map(ip -> CourseItemDetailResponse.builder()
                                            .courseId(ip.getCourseId())
                                            .title(ip.getTitle())
                                            .description(ip.getDescription())
                                            .thumbnailUrl(ip.getThumbnailUrl())
                                            .originalPrice(ip.getOriginalPrice())
                                            .build())
                                    .toList();
                            order.setItems(orderItems);
                        })
                        .toList()
        );
        return orderPaged;
    }

    private TimeStampCursor resolveTimeStampCursor(String nextCursor) {
        return StringUtils.hasText(nextCursor)
                ? PagingUtils.decodeTimeStampCursor(nextCursor)
                : TimeStampCursor.getDefaultCursor(true);
    }
}
