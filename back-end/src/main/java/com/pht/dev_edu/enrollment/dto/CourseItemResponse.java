package com.pht.dev_edu.enrollment.dto;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CourseItemResponse {
    UUID id;
    boolean registered;
    BigDecimal originalPrice;
    BigDecimal discountedPrice;
    String title;
    String thumbnailUrl;
}
