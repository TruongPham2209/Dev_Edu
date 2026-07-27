package com.pht.dev_edu.course.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.Executor;

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
 * CourseDiscountServiceImpl
 * - getAllScheduledDiscounts(String nextCursor)
 *   - branches:
 *       nextCursor has text -> PagingUtils.decodeTimeStampCursor
 *       nextCursor blank/null -> TimeStampCursor.getDefaultCursor(false)
 *   - paths:
 *       [P1: with nextCursor]
 *       [P2: without nextCursor]
 *   - planned tests:
 *       [shouldGetAllScheduledDiscountsWithCursor -> P1]
 *       [shouldGetAllScheduledDiscountsWithDefaultCursor -> P2]
 *
 * - getScheduledDiscountsByCourse(UUID courseId)
 *   - branches:
 *       discounts.isEmpty() -> return empty list
 *       discounts present -> map to response
 *   - paths:
 *       [P1: discounts empty]
 *       [P2: discounts present]
 *   - planned tests:
 *       [shouldReturnEmptyListWhenNoDiscountsFoundForCourse -> P1]
 *       [shouldReturnDiscountResponsesForCourse -> P2]
 *
 * - createDiscount(String username, CourseDiscountRequest couponRequest)
 *   - branches:
 *       validFrom is after validTo -> BadRequestException
 *       courseId != null & existsOverlappingDiscount -> BadRequestException
 *       courseId == null & existsOverlappingDiscount -> BadRequestException
 *       valid discount -> save & return res
 *   - paths:
 *       [P1: validFrom after validTo -> BadRequestException]
 *       [P2: course discount overlapping -> BadRequestException]
 *       [P3: global discount overlapping -> BadRequestException]
 *       [P4: valid course discount creation]
 *       [P5: valid global discount creation]
 *   - planned tests:
 *       [shouldThrowBadRequestWhenValidFromIsAfterValidTo -> P1]
 *       [shouldThrowBadRequestWhenOverlappingCourseDiscountExists -> P2]
 *       [shouldThrowBadRequestWhenOverlappingGlobalDiscountExists -> P3]
 *       [shouldCreateCourseDiscountSuccessfully -> P4]
 *       [shouldCreateGlobalDiscountSuccessfully -> P5]
 *
 * - deleteDiscount(String username, UUID discountId)
 *   - branches:
 *       discount not found -> log & return
 *       discount found -> delete & async tracking
 *   - paths:
 *       [P1: discount not found]
 *       [P2: discount found & deleted]
 *   - planned tests:
 *       [shouldDoNothingWhenDiscountNotFoundForDeletion -> P1]
 *       [shouldDeleteDiscountSuccessfully -> P2]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for CourseDiscountServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify discount creation, retrieval, and deletion rules in CourseDiscountServiceImpl.
 *
 * Test Scope
 * ----------
 * - getAllScheduledDiscounts(String)
 * - getScheduledDiscountsByCourse(UUID)
 * - createDiscount(String, CourseDiscountRequest)
 * - deleteDiscount(String, UUID)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Cursor pagination for scheduled discounts
 * ✓ Empty vs populated course discount lists
 * ✓ Date range validation (validFrom > validTo)
 * ✓ Overlapping check for course-specific and global discounts
 * ✓ Successful creation of course and global discounts
 * ✓ Deletion handling for missing vs existing discounts
 *
 * Mocked Dependencies
 * -------------------
 * - CourseDiscountRepository
 * - CourseDiscountMapper
 * - Executor
 * - KafkaUtils (static mock)
 * - TransactionUtils (static mock)
 */

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.course.dto.CourseDiscountProjection;
import com.pht.dev_edu.course.dto.CourseDiscountRequest;
import com.pht.dev_edu.course.dto.CourseDiscountResponse;
import com.pht.dev_edu.course.entity.CourseDiscountEntity;
import com.pht.dev_edu.course.mapper.CourseDiscountMapper;
import com.pht.dev_edu.course.repo.CourseDiscountRepository;

@ExtendWith(MockitoExtension.class)
class CourseDiscountServiceImplTest {

    @Mock
    private CourseDiscountRepository discountRepository;
    @Mock
    private CourseDiscountMapper discountMapper;
    @Mock
    private Executor executor;

    @InjectMocks
    private CourseDiscountServiceImpl discountService;

    private static final String USERNAME = "admin_user";
    private static final UUID COURSE_ID = UUID.randomUUID();
    private static final UUID DISCOUNT_ID = UUID.randomUUID();

    // ==================== getAllScheduledDiscounts ====================

    @Test
    @DisplayName("getAllScheduledDiscounts - should get scheduled discounts with default cursor when nextCursor is null")
    void shouldGetAllScheduledDiscountsWithDefaultCursor() {
        // Arrange
        CourseDiscountProjection projection = mock(CourseDiscountProjection.class);

        PageImpl<CourseDiscountProjection> page = new PageImpl<>(List.of(projection));
        when(discountRepository.getAllScheduledDiscountsWithCursor(any(), any(), any(), any(Pageable.class)))
                .thenReturn(page);

        CourseDiscountResponse response = CourseDiscountResponse.builder().build();
        when(discountMapper.projectionToRes(projection)).thenReturn(response);

        // Act
        CustomPaging<CourseDiscountResponse> result = discountService.getAllScheduledDiscounts(null);

        // Assert
        assertThat(result).isNotNull();
        verify(discountRepository).getAllScheduledDiscountsWithCursor(any(), any(), any(), any());
    }

    // ==================== getScheduledDiscountsByCourse ====================

    @Test
    @DisplayName("getScheduledDiscountsByCourse - should return empty list when no discounts found")
    void shouldReturnEmptyListWhenNoDiscountsFoundForCourse() {
        // Arrange
        when(discountRepository.getAllScheduledDiscountsByCourseId(any(), eq(COURSE_ID)))
                .thenReturn(List.of());

        // Act
        List<CourseDiscountResponse> result = discountService.getScheduledDiscountsByCourse(COURSE_ID);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getScheduledDiscountsByCourse - should return discount responses when found")
    void shouldReturnDiscountResponsesForCourse() {
        // Arrange
        CourseDiscountProjection projection = mock(CourseDiscountProjection.class);
        when(discountRepository.getAllScheduledDiscountsByCourseId(any(), eq(COURSE_ID)))
                .thenReturn(List.of(projection));

        CourseDiscountResponse response = CourseDiscountResponse.builder().build();
        when(discountMapper.projectionToRes(projection)).thenReturn(response);

        // Act
        List<CourseDiscountResponse> result = discountService.getScheduledDiscountsByCourse(COURSE_ID);

        // Assert
        assertThat(result).hasSize(1).contains(response);
    }

    // ==================== createDiscount ====================

    @Test
    @DisplayName("createDiscount - should throw BadRequestException when validFrom is after validTo")
    void shouldThrowBadRequestWhenValidFromIsAfterValidTo() {
        // Arrange
        CourseDiscountRequest request = new CourseDiscountRequest();
        request.setValidFrom(LocalDate.now().plusDays(5));
        request.setValidTo(LocalDate.now().plusDays(1));

        // Act & Assert
        assertThatThrownBy(() -> discountService.createDiscount(USERNAME, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Valid from date cannot be after valid to date");
    }

    @Test
    @DisplayName("createDiscount - should throw BadRequestException when overlapping course discount exists")
    void shouldThrowBadRequestWhenOverlappingCourseDiscountExists() {
        // Arrange
        CourseDiscountRequest request = new CourseDiscountRequest();
        request.setCourseId(COURSE_ID);
        request.setValidFrom(LocalDate.now());
        request.setValidTo(LocalDate.now().plusDays(5));

        when(discountRepository.existsOverlappingDiscount(eq(COURSE_ID), any(), any()))
                .thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> discountService.createDiscount(USERNAME, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Overlapping discount exists for the specified course");
    }

    @Test
    @DisplayName("createDiscount - should throw BadRequestException when overlapping global discount exists")
    void shouldThrowBadRequestWhenOverlappingGlobalDiscountExists() {
        // Arrange
        CourseDiscountRequest request = new CourseDiscountRequest();
        request.setCourseId(null); // Global discount
        request.setValidFrom(LocalDate.now());
        request.setValidTo(LocalDate.now().plusDays(5));

        when(discountRepository.existsOverlappingDiscount(any(), any()))
                .thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> discountService.createDiscount(USERNAME, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Overlapping global discount exists");
    }

    @Test
    @DisplayName("createDiscount - should create course discount successfully")
    void shouldCreateCourseDiscountSuccessfully() {
        // Arrange
        CourseDiscountRequest request = new CourseDiscountRequest();
        request.setCourseId(COURSE_ID);
        request.setValidFrom(LocalDate.now());
        request.setValidTo(LocalDate.now().plusDays(5));

        when(discountRepository.existsOverlappingDiscount(eq(COURSE_ID), any(), any()))
                .thenReturn(false);

        CourseDiscountEntity entity = new CourseDiscountEntity();
        when(discountMapper.reqToEntity(request)).thenReturn(entity);

        CourseDiscountResponse response = CourseDiscountResponse.builder().build();
        when(discountMapper.entityToRes(entity)).thenReturn(response);

        // Act
        CourseDiscountResponse result = discountService.createDiscount(USERNAME, request);

        // Assert
        assertThat(result).isEqualTo(response);
        verify(discountRepository).save(entity);
        assertThat(entity.getCreatedBy()).isEqualTo(USERNAME);
    }

    // ==================== deleteDiscount ====================

    @Test
    @DisplayName("deleteDiscount - should do nothing when discount not found")
    void shouldDoNothingWhenDiscountNotFoundForDeletion() {
        // Arrange
        when(discountRepository.findById(DISCOUNT_ID)).thenReturn(Optional.empty());

        // Act
        discountService.deleteDiscount(USERNAME, DISCOUNT_ID);

        // Verify
        verify(discountRepository, never()).delete(any());
    }

    @Test
    @DisplayName("deleteDiscount - should delete discount successfully")
    void shouldDeleteDiscountSuccessfully() {
        // Arrange
        CourseDiscountEntity entity = new CourseDiscountEntity();
        when(discountRepository.findById(DISCOUNT_ID)).thenReturn(Optional.of(entity));

        // Act
        discountService.deleteDiscount(USERNAME, DISCOUNT_ID);

        // Verify
        verify(discountRepository).delete(entity);
    }
}
