package com.pht.dev_edu.metric.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class TopContributorDto {
    String username;
    String fullName;
    long postCount;
    long commentCount;
}
