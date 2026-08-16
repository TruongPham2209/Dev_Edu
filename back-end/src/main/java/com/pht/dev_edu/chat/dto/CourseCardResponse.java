package com.pht.dev_edu.chat.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseCardResponse {
    UUID courseId;
    String title;
    String shortDescription;
    BigDecimal price;
    String thumbnailUrl;
    String matchReason;
}
