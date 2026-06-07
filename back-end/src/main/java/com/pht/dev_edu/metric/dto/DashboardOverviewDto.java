package com.pht.dev_edu.metric.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;

@Value
@Builder
public class DashboardOverviewDto {
    long totalUsers;
    long totalCourses;
    long totalLectures;
    long totalAssignments;
    long totalEnrollments;
    BigDecimal totalRevenue;
    double courseCompletionRate;
}
