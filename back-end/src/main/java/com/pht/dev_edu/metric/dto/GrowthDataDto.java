package com.pht.dev_edu.metric.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;

@Value
@Builder
public class GrowthDataDto {
    LocalDate date;
    long count;
}
