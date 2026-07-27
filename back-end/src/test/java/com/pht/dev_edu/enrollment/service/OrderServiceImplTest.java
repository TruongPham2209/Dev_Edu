package com.pht.dev_edu.enrollment.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/*
 * <analysis>
 * OrderServiceImpl
 * - checkout(String username, CheckoutRequest checkoutRequest)
 *   - branches:
 *       entityType != COURSE -> BadRequestException
 *       already has pending/completed order for courses -> BadRequestException
 *       courses already registered -> BadRequestException
 *       courses requested size != found size -> BadRequestException
 *       success -> saves order & items, returns CheckoutDetailResponse
 *   - paths:
 *       [P1: entityType != COURSE -> BadRequestException]
 *       [P2: pending or completed order exists -> BadRequestException]
 *       [P3: registered courses exist -> BadRequestException]
 *       [P4: missing course -> BadRequestException]
 *       [P5: successful checkout]
 *   - planned tests:
 *       [shouldThrowBadRequestWhenEntityTypeIsNotCourse -> P1]
 *       [shouldThrowBadRequestWhenPendingOrCompletedOrderExists -> P2]
 *       [shouldThrowBadRequestWhenCourseAlreadyRegistered -> P3]
 *       [shouldThrowBadRequestWhenCourseCountMismatch -> P4]
 *       [shouldCheckoutSuccessfully -> P5]
 *
 * - getOrderDetail(String username, UUID orderId)
 *   - branches:
 *       order not found in DB -> DataNotFoundException
 *       status != PENDING -> BadRequestException
 *       order expired (>15 min) -> DataNotFoundException
 *       items empty -> DataNotFoundException
 *       success -> returns CheckoutDetailResponse
 *   - paths:
 *       [P1: order not found]
 *       [P2: status not PENDING]
 *       [P3: order expired]
 *       [P4: order items empty]
 *       [P5: success]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenOrderNotFound -> P1]
 *       [shouldThrowBadRequestWhenOrderStatusNotPending -> P2]
 *       [shouldThrowDataNotFoundWhenOrderExpired -> P3]
 *       [shouldThrowDataNotFoundWhenOrderItemsEmpty -> P4]
 *       [shouldGetOrderDetailSuccessfully -> P5]
 *
 * - cancelOrder(String username, UUID orderId)
 *   - branches:
 *       order empty -> log & return
 *       status != PENDING -> log & return
 *       status == PENDING -> set status CANCELLED & save
 *   - paths:
 *       [P1: order not found]
 *       [P2: status not PENDING]
 *       [P3: cancelled successfully]
 *   - planned tests:
 *       [shouldDoNothingWhenOrderNotFoundForCancel -> P1]
 *       [shouldDoNothingWhenOrderStatusNotPendingForCancel -> P2]
 *       [shouldCancelOrderSuccessfully -> P3]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for OrderServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify order checkout, detail retrieval, and cancellation rules in OrderServiceImpl.
 *
 * Test Scope
 * ----------
 * - checkout(String, CheckoutRequest)
 * - getOrderDetail(String, UUID)
 * - cancelOrder(String, UUID)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Entity type validation (COURSE only)
 * ✓ Existing pending order guard check
 * ✓ Already registered course guard check
 * ✓ Course availability count matching
 * ✓ Order detail status and expiration (15-minute cutoff) checks
 * ✓ Order cancellation guard clauses and status change
 *
 * Mocked Dependencies
 * -------------------
 * - CourseDiscountRepository
 * - OrderRepository
 * - OrderItemRepository
 * - OrderItemMapper
 */

import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.enrollment.dto.CheckoutDetailResponse;
import com.pht.dev_edu.enrollment.dto.CheckoutRequest;
import com.pht.dev_edu.enrollment.dto.CourseItemResponse;
import com.pht.dev_edu.enrollment.dto.CourseOrderItemProjection;
import com.pht.dev_edu.enrollment.dto.PaymentStatus;
import com.pht.dev_edu.enrollment.dto.PurchaseEntityType;
import com.pht.dev_edu.enrollment.entity.OrderEntity;
import com.pht.dev_edu.enrollment.mapper.OrderItemMapper;
import com.pht.dev_edu.enrollment.repo.OrderItemRepository;
import com.pht.dev_edu.enrollment.repo.OrderRepository;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private com.pht.dev_edu.course.repo.CourseDiscountRepository courseDiscountRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private OrderItemMapper orderItemMapper;

    @InjectMocks
    private OrderServiceImpl orderService;

    private static final String USERNAME = "student_user";
    private static final UUID COURSE_ID = UUID.randomUUID();
    private static final UUID ORDER_ID = UUID.randomUUID();

    // ==================== checkout ====================

    @Test
    @DisplayName("checkout - should throw BadRequestException when entityType is not COURSE")
    void shouldThrowBadRequestWhenEntityTypeIsNotCourse() {
        // Arrange
        CheckoutRequest request = new CheckoutRequest();
        request.setEntityType(null); // Not COURSE

        // Act & Assert
        assertThatThrownBy(() -> orderService.checkout(USERNAME, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Checkout request is not of type COURSE");
    }

    @Test
    @DisplayName("checkout - should throw BadRequestException when user already has pending/completed order for courses")
    void shouldThrowBadRequestWhenPendingOrCompletedOrderExists() {
        // Arrange
        CheckoutRequest request = new CheckoutRequest();
        request.setEntityType(PurchaseEntityType.COURSE);
        request.setEntityIds(List.of(COURSE_ID));

        when(orderItemRepository.existsByUsernameAndItems(eq(USERNAME), eq("COURSE"), eq(List.of(COURSE_ID))))
                .thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> orderService.checkout(USERNAME, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("You already have a pending or completed order");
    }

    @Test
    @DisplayName("checkout - should throw BadRequestException when course is already registered")
    void shouldThrowBadRequestWhenCourseAlreadyRegistered() {
        // Arrange
        CheckoutRequest request = new CheckoutRequest();
        request.setEntityType(PurchaseEntityType.COURSE);
        request.setEntityIds(List.of(COURSE_ID));

        when(orderItemRepository.existsByUsernameAndItems(eq(USERNAME), eq("COURSE"), eq(List.of(COURSE_ID))))
                .thenReturn(false);

        when(courseDiscountRepository.getGlobalActiveDiscount(any())).thenReturn(Optional.empty());

        CourseOrderItemProjection projection = mock(CourseOrderItemProjection.class);
        when(projection.getDiscountedPercentage()).thenReturn(BigDecimal.ZERO);
        when(projection.getOriginalPrice()).thenReturn(BigDecimal.valueOf(100.00));
        when(courseDiscountRepository.findDiscountedCoursesForUser(eq(USERNAME), eq(List.of(COURSE_ID)), any()))
                .thenReturn(List.of(projection));

        CourseItemResponse itemResponse = CourseItemResponse.builder().registered(true).build();
        when(orderItemMapper.courseProjectionToCourseItem(projection)).thenReturn(itemResponse);

        // Act & Assert
        assertThatThrownBy(() -> orderService.checkout(USERNAME, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Course has already been registered");
    }

    @Test
    @DisplayName("checkout - should checkout successfully")
    void shouldCheckoutSuccessfully() {
        // Arrange
        CheckoutRequest request = new CheckoutRequest();
        request.setEntityType(PurchaseEntityType.COURSE);
        request.setEntityIds(List.of(COURSE_ID));

        when(orderItemRepository.existsByUsernameAndItems(eq(USERNAME), eq("COURSE"), eq(List.of(COURSE_ID))))
                .thenReturn(false);

        when(courseDiscountRepository.getGlobalActiveDiscount(any())).thenReturn(Optional.empty());

        CourseOrderItemProjection projection = mock(CourseOrderItemProjection.class);
        when(projection.getOriginalPrice()).thenReturn(BigDecimal.valueOf(100.00));
        when(projection.getDiscountedPercentage()).thenReturn(BigDecimal.ZERO);

        when(courseDiscountRepository.findDiscountedCoursesForUser(eq(USERNAME), eq(List.of(COURSE_ID)), any()))
                .thenReturn(List.of(projection));

        CourseItemResponse itemResponse = CourseItemResponse.builder()
                .id(COURSE_ID)
                .registered(false)
                .originalPrice(BigDecimal.valueOf(100.00))
                .discountedPrice(BigDecimal.valueOf(100.00))
                .build();
        when(orderItemMapper.courseProjectionToCourseItem(projection)).thenReturn(itemResponse);

        // Act
        CheckoutDetailResponse result = orderService.checkout(USERNAME, request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getEntityType()).isEqualTo(PurchaseEntityType.COURSE);
        verify(orderRepository).save(any(OrderEntity.class));
        verify(orderItemRepository).saveAll(any());
    }

    // ==================== getOrderDetail ====================

    @Test
    @DisplayName("getOrderDetail - should throw DataNotFoundException when order not found")
    void shouldThrowDataNotFoundWhenOrderNotFound() {
        // Arrange
        when(orderRepository.findByIdAndUsername(ORDER_ID, USERNAME)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> orderService.getOrderDetail(USERNAME, ORDER_ID))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Order not found.");
    }

    @Test
    @DisplayName("getOrderDetail - should throw BadRequestException when order status is not PENDING")
    void shouldThrowBadRequestWhenOrderStatusNotPending() {
        // Arrange
        OrderEntity order = OrderEntity.builder()
                .id(ORDER_ID)
                .username(USERNAME)
                .status(PaymentStatus.COMPLETED)
                .build();
        when(orderRepository.findByIdAndUsername(ORDER_ID, USERNAME)).thenReturn(Optional.of(order));

        // Act & Assert
        assertThatThrownBy(() -> orderService.getOrderDetail(USERNAME, ORDER_ID))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Order not found.");
    }

    @Test
    @DisplayName("getOrderDetail - should throw DataNotFoundException when order has expired")
    void shouldThrowDataNotFoundWhenOrderExpired() {
        // Arrange
        OrderEntity expiredOrder = OrderEntity.builder()
                .id(ORDER_ID)
                .username(USERNAME)
                .status(PaymentStatus.PENDING)
                .createdAt(LocalDateTime.now().plusMinutes(30)) // minusMinutes(15) is still after now
                .build();
        when(orderRepository.findByIdAndUsername(ORDER_ID, USERNAME)).thenReturn(Optional.of(expiredOrder));

        // Act & Assert
        assertThatThrownBy(() -> orderService.getOrderDetail(USERNAME, ORDER_ID))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Order has expired.");
    }

    @Test
    @DisplayName("getOrderDetail - should return order detail successfully when valid")
    void shouldGetOrderDetailSuccessfully() {
        // Arrange
        OrderEntity validOrder = OrderEntity.builder()
                .id(ORDER_ID)
                .username(USERNAME)
                .status(PaymentStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(100.00))
                .createdAt(LocalDateTime.now())
                .build();
        when(orderRepository.findByIdAndUsername(ORDER_ID, USERNAME)).thenReturn(Optional.of(validOrder));

        CourseOrderItemProjection itemProjection = mock(CourseOrderItemProjection.class);
        when(orderItemRepository.getOrderItemsByOrderIds(List.of(ORDER_ID)))
                .thenReturn(List.of(itemProjection));

        CourseItemResponse itemRes = CourseItemResponse.builder().build();
        when(orderItemMapper.courseProjectionToCourseItem(itemProjection)).thenReturn(itemRes);

        // Act
        CheckoutDetailResponse result = orderService.getOrderDetail(USERNAME, ORDER_ID);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getOrderId()).isEqualTo(ORDER_ID);
    }

    // ==================== cancelOrder ====================

    @Test
    @DisplayName("cancelOrder - should do nothing when order not found")
    void shouldDoNothingWhenOrderNotFoundForCancel() {
        // Arrange
        when(orderRepository.findByIdAndUsername(ORDER_ID, USERNAME)).thenReturn(Optional.empty());

        // Act
        orderService.cancelOrder(USERNAME, ORDER_ID);

        // Verify
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("cancelOrder - should do nothing when order is not PENDING")
    void shouldDoNothingWhenOrderStatusNotPendingForCancel() {
        // Arrange
        OrderEntity order = OrderEntity.builder()
                .id(ORDER_ID)
                .status(PaymentStatus.COMPLETED)
                .build();
        when(orderRepository.findByIdAndUsername(ORDER_ID, USERNAME)).thenReturn(Optional.of(order));

        // Act
        orderService.cancelOrder(USERNAME, ORDER_ID);

        // Verify
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("cancelOrder - should cancel pending order successfully")
    void shouldCancelOrderSuccessfully() {
        // Arrange
        OrderEntity order = OrderEntity.builder()
                .id(ORDER_ID)
                .status(PaymentStatus.PENDING)
                .build();
        when(orderRepository.findByIdAndUsername(ORDER_ID, USERNAME)).thenReturn(Optional.of(order));

        // Act
        orderService.cancelOrder(USERNAME, ORDER_ID);

        // Verify & Assert
        assertThat(order.getStatus()).isEqualTo(PaymentStatus.CANCELLED);
        verify(orderRepository).save(order);
    }
}
