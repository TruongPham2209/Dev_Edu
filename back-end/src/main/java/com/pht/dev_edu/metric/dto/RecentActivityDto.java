package com.pht.dev_edu.metric.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class RecentActivityDto {
    String username;
    String action;
    String details;
    LocalDateTime createdAt;
}
