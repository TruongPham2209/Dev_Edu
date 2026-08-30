package com.pht.dev_edu.metric.service;

import com.pht.dev_edu.metric.dto.*;

import java.util.List;

/**
 * Service for computing business metrics, dashboard analytics, user growth, and revenue statistics.
 */
public interface MetricService {

    /**
     * Retrieves overall administrative dashboard overview metrics (total users, courses, revenue, orders).
     *
     * @return the {@link DashboardOverviewDto} containing summary statistics.
     */
    DashboardOverviewDto getDashboardOverview();

    /**
     * Computes user growth metrics over a specified time period.
     *
     * @param period the {@link GrowthPeriod} grouping (DAY, WEEK, MONTH, YEAR).
     * @return a list of {@link GrowthDataDto} points.
     */
    List<GrowthDataDto> getUserGrowth(GrowthPeriod period);

    /**
     * Computes course growth metrics over a specified time period.
     *
     * @param period the {@link GrowthPeriod} grouping.
     * @return a list of {@link GrowthDataDto} points.
     */
    List<GrowthDataDto> getCourseGrowth(GrowthPeriod period);

    /**
     * Computes revenue growth metrics over a specified time period.
     *
     * @param period the {@link GrowthPeriod} grouping.
     * @return a list of {@link RevenueGrowthDto} points.
     */
    List<RevenueGrowthDto> getRevenueGrowth(GrowthPeriod period);

    /**
     * Computes user activity metrics over the last N days.
     *
     * @param days the number of preceding days to aggregate.
     * @return the {@link ActivityMetricDto} containing activity statistics.
     */
    ActivityMetricDto getActivityMetrics(int days);

    /**
     * Retrieves the top courses ranked by enrollment or revenue.
     *
     * @param limit the maximum number of top courses to return.
     * @return a list of {@link TopCourseDto} items.
     */
    List<TopCourseDto> getTopCourses(int limit);

    /**
     * Retrieves top performing users (top students / lecturers).
     *
     * @param limit the maximum number of top users to return.
     * @return the {@link TopUserDto} containing top user summaries.
     */
    TopUserDto getTopUsers(int limit);
}
