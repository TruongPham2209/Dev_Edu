package com.pht.dev_edu.metric.repo;

import com.pht.dev_edu.metric.dto.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface MetricRepository {
    long countTotalUsers();

    long countTotalCourses();

    long countTotalLectures();

    long countTotalAssignments();

    long countTotalEnrollments();

    BigDecimal calculateTotalRevenue();

    double calculateCourseCompletionRate();

    List<GrowthDataDto> getUserGrowth(GrowthPeriod period, LocalDateTime since);

    List<GrowthDataDto> getCourseGrowth(GrowthPeriod period, LocalDateTime since);

    List<RevenueGrowthDto> getRevenueGrowth(GrowthPeriod period, LocalDateTime since);

    long countDailyActiveUsers(LocalDateTime since);

    long countTotalRequests(LocalDateTime since);

    List<RecentActivityDto> getRecentActivities(int limit);

    Map<String, Long> getActionDistribution(LocalDateTime since);

    List<TopCourseDto> getTopCourses(int limit);

    List<TopStudentDto> getTopStudents(int limit);

    List<TopContributorDto> getTopContributors(int limit);
}
