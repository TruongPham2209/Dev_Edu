package com.pht.dev_edu.enrollment.service;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.TimeStampCursor;
import com.pht.dev_edu.common.util.PagingUtils;
import com.pht.dev_edu.enrollment.dto.CourseDiscountProjection;
import com.pht.dev_edu.enrollment.dto.EnrolledCourseResponse;
import com.pht.dev_edu.enrollment.dto.PurchaseEntityType;
import com.pht.dev_edu.enrollment.repo.CartItemRepository;
import com.pht.dev_edu.enrollment.repo.CourseDiscountRepository;
import com.pht.dev_edu.enrollment.repo.EnrollmentRepository;
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

    // TODO: update dto to see original and discounted price
    @Override
    public CustomPaging<EnrolledCourseResponse> getCoursesInCart(String username, String nextCursor) {
        var pageable = PageRequest.of(0, 10);
        var timeCursor = resolveTimeStampCursor(nextCursor);

        var globalDiscountPercentage = courseDiscountRepository.getGlobalActiveDiscount(LocalDateTime.now()).orElse(BigDecimal.ZERO);
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

                    return EnrolledCourseResponse.builder()
                            .id(ci.getId())
                            .courseId(ci.getCourseId())
                            .title(ci.getCourseTitle())
                            .description(ci.getCourseDescription())
                            .thumbnailUrl(ci.getCourseThumbnailUrl())
                            .amount(discountedPrice)
                            .build();
                },
                CourseDiscountProjection::getCreatedAt,
                CourseDiscountProjection::getId
        );
    }

    private TimeStampCursor resolveTimeStampCursor(String nextCursor) {
        return StringUtils.hasText(nextCursor)
                ? PagingUtils.decodeTimeStampCursor(nextCursor)
                : TimeStampCursor.getDefaultCursor(true);
    }
}
