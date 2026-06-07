package com.pht.dev_edu.metric.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDate;

@Value
@Builder
public class RevenueGrowthDto {
    LocalDate date;
    BigDecimal amount;
}
