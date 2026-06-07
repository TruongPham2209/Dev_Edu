package com.pht.dev_edu.metric.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;
import java.util.Map;

@Value
@Builder
public class ActivityMetricDto {
    long dailyActiveUsers;
    long totalRequestLogs;
    List<RecentActivityDto> recentActivities;
    Map<String, Long> actionDistribution;
}
