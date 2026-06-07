package com.pht.dev_edu.metric.service;

import com.pht.dev_edu.metric.dto.*;

import java.util.List;

public interface MetricService {
    DashboardOverviewDto getDashboardOverview();

    List<GrowthDataDto> getUserGrowth(GrowthPeriod period);

    List<GrowthDataDto> getCourseGrowth(GrowthPeriod period);

    List<RevenueGrowthDto> getRevenueGrowth(GrowthPeriod period);

    ActivityMetricDto getActivityMetrics(int days);

    List<TopCourseDto> getTopCourses(int limit);

    TopUserDto getTopUsers(int limit);
}
