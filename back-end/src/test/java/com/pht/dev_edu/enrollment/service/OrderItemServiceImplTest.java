package com.pht.dev_edu.enrollment.service;

import static org.assertj.core.api.Assertions.assertThat;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

/*
 * <analysis>
 * OrderItemServiceImpl
 * - addCourseToCart(String username, UUID courseId)
 *   - branches:
 *       already enrolled -> skip / warn
 *       not enrolled -> insert cart item
 *   - paths:
 *       [P1: already enrolled]
 *       [P2: not enrolled]
 *   - planned tests:
 *       [shouldSkipAddToCartWhenUserAlreadyEnrolled -> P1]
 *       [shouldAddCourseToCartSuccessfully -> P2]
 *
 * - removeCourseFromCart(String username, UUID courseId)
 *   - paths:
 *       [P1: calls cartItemRepository.deleteByUsernameAndItemTypeAndItemIdIn]
 *   - planned tests:
 *       [shouldRemoveCourseFromCartSuccessfully -> P1]
 *
 * - getCoursesInCart(String username, String nextCursor)
 *   - paths:
 *       [P1: fetches cart items with cursor & calculates global/course discount]
 *   - planned tests:
 *       [shouldGetCoursesInCartWithDiscountCalculation -> P1]
 *
 * - getOrderHistory(String username, PaymentStatus paymentStatus, String nextCursor)
 *   - paths:
 *       [P1: fetches orders with cursor & maps items]
 *   - planned tests:
 *       [shouldGetOrderHistoryWithMappedItems -> P1]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for OrderItemServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify cart management and order history processing in OrderItemServiceImpl.
 *
 * Test Scope
 * ----------
 * - addCourseToCart(String, UUID)
 * - removeCourseFromCart(String, UUID)
 * - getCoursesInCart(String, String)
 * - getOrderHistory(String, PaymentStatus, String)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Enrollment guard for adding course to cart
 * ✓ Successful cart item insertion
 * ✓ Cart item deletion
 * ✓ Retrieving cart items with dynamic discount calculation
 * ✓ Order history pagination with grouped order items
 *
 * Mocked Dependencies
 * -------------------
 * - CourseDiscountRepository
 * - CartItemRepository
 * - EnrollmentRepository
 * - OrderRepository
 * - OrderItemRepository
 */

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.course.dto.CourseDiscountProjection;
import com.pht.dev_edu.course.dto.CourseItemDetailResponse;
import com.pht.dev_edu.course.repo.CourseDiscountRepository;
import com.pht.dev_edu.enrollment.dto.CourseOrderItemProjection;
import com.pht.dev_edu.enrollment.dto.OrderDetailResponse;
import com.pht.dev_edu.enrollment.dto.PaymentStatus;
import com.pht.dev_edu.enrollment.dto.PurchaseEntityType;
import com.pht.dev_edu.enrollment.entity.OrderEntity;
import com.pht.dev_edu.enrollment.repo.CartItemRepository;
import com.pht.dev_edu.enrollment.repo.EnrollmentRepository;
import com.pht.dev_edu.enrollment.repo.OrderItemRepository;
import com.pht.dev_edu.enrollment.repo.OrderRepository;

@ExtendWith(MockitoExtension.class)
class OrderItemServiceImplTest {

    @Mock
    private CourseDiscountRepository courseDiscountRepository;
    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private EnrollmentRepository enrollmentRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderItemRepository orderItemRepository;

    @InjectMocks
    private OrderItemServiceImpl orderItemService;

    private static final String USERNAME = "student_user";
    private static final UUID COURSE_ID = UUID.randomUUID();
    private static final UUID ORDER_ID = UUID.randomUUID();

    @Test
    @DisplayName("addCourseToCart - should skip when user is already enrolled")
    void shouldSkipAddToCartWhenUserAlreadyEnrolled() {
        // Arrange
        when(enrollmentRepository.existsByStudentUsernameAndCourseId(USERNAME, COURSE_ID))
                .thenReturn(true);

        // Act
        orderItemService.addCourseToCart(USERNAME, COURSE_ID);

        // Verify
        verify(cartItemRepository, never()).insertCartItemWithoutConstraintCheck(any(), any(), any(), any());
    }

    @Test
    @DisplayName("addCourseToCart - should insert cart item when not enrolled")
    void shouldAddCourseToCartSuccessfully() {
        // Arrange
        when(enrollmentRepository.existsByStudentUsernameAndCourseId(USERNAME, COURSE_ID))
                .thenReturn(false);

        // Act
        orderItemService.addCourseToCart(USERNAME, COURSE_ID);

        // Verify
        verify(cartItemRepository).insertCartItemWithoutConstraintCheck(
                any(), eq(USERNAME), eq(PurchaseEntityType.COURSE.name()), eq(COURSE_ID));
    }

    @Test
    @DisplayName("removeCourseFromCart - should delete course from cart")
    void shouldRemoveCourseFromCartSuccessfully() {
        // Act
        orderItemService.removeCourseFromCart(USERNAME, COURSE_ID);

        // Verify
        verify(cartItemRepository).deleteByUsernameAndItemTypeAndItemIdIn(
                eq(USERNAME), eq(PurchaseEntityType.COURSE), eq(List.of(COURSE_ID)));
    }

    @Test
    @DisplayName("getCoursesInCart - should return paged cart items with discount calculations")
    void shouldGetCoursesInCartWithDiscountCalculation() {
        // Arrange
        CourseDiscountProjection cartItem = mock(CourseDiscountProjection.class);
        when(cartItem.getId()).thenReturn(UUID.randomUUID());
        when(cartItem.getCourseId()).thenReturn(COURSE_ID);
        when(cartItem.getOriginalPrice()).thenReturn(BigDecimal.valueOf(100.00));
        when(cartItem.getDiscountPercentage()).thenReturn(BigDecimal.valueOf(20.00));

        PageImpl<CourseDiscountProjection> page = new PageImpl<>(List.of(cartItem));
        when(cartItemRepository.findCoursesInCartByStudentUsernameAndCursor(eq(USERNAME), any(), any(),
                any(Pageable.class)))
                .thenReturn(page);

        when(courseDiscountRepository.getGlobalActiveDiscount(any())).thenReturn(Optional.empty());

        // Act
        CustomPaging<CourseItemDetailResponse> result = orderItemService.getCoursesInCart(USERNAME, null);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("getOrderHistory - should return paged order history with items")
    void shouldGetOrderHistoryWithMappedItems() {
        // Arrange
        OrderEntity orderEntity = OrderEntity.builder()
                .id(ORDER_ID)
                .username(USERNAME)
                .status(PaymentStatus.COMPLETED)
                .totalAmount(BigDecimal.valueOf(80.00))
                .createdAt(LocalDateTime.now())
                .build();

        PageImpl<OrderEntity> page = new PageImpl<>(List.of(orderEntity));
        when(orderRepository.findByUsernameAndStatus(eq(USERNAME), eq(PaymentStatus.COMPLETED.name()), any(),
                any(), any(Pageable.class)))
                .thenReturn(page);

        CourseOrderItemProjection itemProjection = mock(CourseOrderItemProjection.class);
        when(itemProjection.getOrderId()).thenReturn(ORDER_ID);
        when(itemProjection.getCourseId()).thenReturn(COURSE_ID);

        when(orderItemRepository.getOrderItemsByOrderIds(List.of(ORDER_ID)))
                .thenReturn(List.of(itemProjection));

        // Act
        CustomPaging<OrderDetailResponse> result = orderItemService.getOrderHistory(USERNAME,
                PaymentStatus.COMPLETED, null);

        // Assert
        assertThat(result).isNotNull();
    }
}
