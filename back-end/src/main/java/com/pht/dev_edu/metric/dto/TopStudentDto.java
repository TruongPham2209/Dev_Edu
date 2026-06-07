package com.pht.dev_edu.metric.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;

@Value
@Builder
public class TopStudentDto {
    String username;
    String fullName;
    String email;
    long enrollmentCount;
    BigDecimal totalSpent;
}
