package com.pht.dev_edu.course.service;

import com.pht.dev_edu.common.constant.EventTrackingConstant;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.TimeStampCursor;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.common.util.PagingUtils;
import com.pht.dev_edu.common.util.TransactionUtils;
import com.pht.dev_edu.course.dto.CourseDiscountProjection;
import com.pht.dev_edu.course.dto.CourseDiscountRequest;
import com.pht.dev_edu.course.dto.CourseDiscountResponse;
import com.pht.dev_edu.course.mapper.CourseDiscountMapper;
import com.pht.dev_edu.course.repo.CourseDiscountRepository;
import com.pht.dev_edu.tracking.dto.TrackingEvent;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Executor;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CourseDiscountServiceImpl implements CourseDiscountService {
    CourseDiscountRepository discountRepository;

    Executor executor;
    CourseDiscountMapper discountMapper;


    @Override
    public CustomPaging<CourseDiscountResponse> getAllScheduledDiscounts(String nextCursor) {
        var cursor = StringUtils.hasText(nextCursor)
                ? PagingUtils.decodeTimeStampCursor(nextCursor)
                : TimeStampCursor.getDefaultCursor(true);
        var pageable = PageRequest.of(0, 21);

        var validStartTime = LocalDate.now().atStartOfDay();
        var discountPage = discountRepository.getAllScheduledDiscountsWithCursor(validStartTime, cursor.getId(), cursor.getTimeStamp(), pageable);

        return PagingUtils.getPagedWithCursor(
                discountPage,
                discountMapper::projectionToRes,
                CourseDiscountProjection::getCreatedAt,
                CourseDiscountProjection::getId,
                pageable.getPageSize() - 1
        );
    }

    @Override
    public List<CourseDiscountResponse> getScheduledDiscountsByCourse(UUID courseId) {
        var validStartTime = LocalDate.now().atStartOfDay();
        var discounts = discountRepository.getAllScheduledDiscountsByCourseId(validStartTime, courseId);
        if (discounts.isEmpty()) {
            log.info("No scheduled discounts found for courseId: {}", courseId);
            return List.of();
        }

        return discounts.stream()
                .map(discountMapper::projectionToRes)
                .toList();
    }

    @Override
    @Transactional
    public CourseDiscountResponse createDiscount(String username, CourseDiscountRequest couponRequest) {
        if (couponRequest.getValidFrom().isAfter(couponRequest.getValidTo())) {
            log.error("Valid from date cannot be after valid to date: validFrom={}, validTo={}",
                    couponRequest.getValidFrom(), couponRequest.getValidTo());
            throw new BadRequestException("Valid from date cannot be after valid to date");
        }

        var validFrom = couponRequest.getValidFrom().atStartOfDay();
        var validTo = (couponRequest.getValidTo().plusDays(1).atStartOfDay()).minusSeconds(1);

        if (couponRequest.getCourseId() != null
                && discountRepository.existsOverlappingDiscount(
                couponRequest.getCourseId(),
                validFrom,
                validTo
        )) {
            log.error("Overlapping discount exists for courseId: {}, validFrom: {}, validTo: {}",
                    couponRequest.getCourseId(), couponRequest.getValidFrom(), couponRequest.getValidTo());
            throw new BadRequestException("Overlapping discount exists for the specified course and time period");
        }

        if (couponRequest.getCourseId() == null
                && discountRepository.existsOverlappingDiscount(
                validFrom,
                validTo
        )) {
            log.error("Overlapping global discount exists for validFrom: {}, validTo: {}",
                    couponRequest.getValidFrom(), couponRequest.getValidTo());
            throw new BadRequestException("Overlapping global discount exists for the specified time period");
        }

        var couponEntity = discountMapper.reqToEntity(couponRequest);
        couponEntity.setCreatedBy(username);
        couponEntity.setValidFrom(validFrom);
        couponEntity.setValidTo(validTo);

        discountRepository.save(couponEntity);
        return discountMapper.entityToRes(couponEntity);
    }

    @Override
    @Transactional
    public void deleteDiscount(String username, UUID discountId) {
        var discount = discountRepository.findById(discountId)
                .orElse(null);

        if (discount == null) {
            log.error("Discount not found for id: {}", discountId);
            return;
        }

        discountRepository.delete(discount);
        TransactionUtils.runAfterCommitAsync(() -> {
            var trackingEvent = TrackingEvent.builder()
                    .username(username)
                    .aggregateId(discountId)
                    .action(EventTrackingConstant.COURSE_DISCOUNT_DELETED)
                    .details("Deleted course discount with id: " + discountId)
                    .build();
            KafkaUtils.sendTrackingEvent(trackingEvent);
        }, executor);
    }
}
