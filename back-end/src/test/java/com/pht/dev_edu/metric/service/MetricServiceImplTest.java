package com.pht.dev_edu.metric.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.pht.dev_edu.metric.dto.ActivityMetricDto;
import com.pht.dev_edu.metric.dto.DashboardOverviewDto;
import com.pht.dev_edu.metric.dto.GrowthDataDto;
import com.pht.dev_edu.metric.dto.GrowthPeriod;
import com.pht.dev_edu.metric.dto.RecentActivityDto;
import com.pht.dev_edu.metric.dto.RevenueGrowthDto;
import com.pht.dev_edu.metric.dto.TopContributorDto;
import com.pht.dev_edu.metric.dto.TopCourseDto;
import com.pht.dev_edu.metric.dto.TopStudentDto;
import com.pht.dev_edu.metric.dto.TopUserDto;
import com.pht.dev_edu.metric.repo.MetricRepository;

/*
 * <analysis>
 * MetricServiceImpl
 * - getDashboardOverview()
 *   - paths: [P1: aggregate total users, courses, lectures, assignments, enrollments, revenue, completion rate]
 *   - planned tests: [shouldGetDashboardOverview -> P1]
 *
 * - getUserGrowth(GrowthPeriod period)
 *   - paths:
 *       [P1: DAILY period -> calculate daily date series and fill gaps]
 *       [P2: WEEKLY period -> calculate weekly date series and fill gaps]
 *       [P3: MONTHLY period -> calculate monthly date series and fill gaps]
 *       [P4: YEARLY period -> calculate yearly date series and fill gaps]
 *   - planned tests:
 *       [shouldGetUserGrowthDaily -> P1]
 *       [shouldGetUserGrowthWeekly -> P2]
 *       [shouldGetUserGrowthMonthly -> P3]
 *       [shouldGetUserGrowthYearly -> P4]
 *
 * - getCourseGrowth(GrowthPeriod period)
 *   - paths: [P1: aggregate course creation growth over period]
 *   - planned tests: [shouldGetCourseGrowth -> P1]
 *
 * - getRevenueGrowth(GrowthPeriod period)
 *   - paths: [P1: aggregate financial revenue growth over period]
 *   - planned tests: [shouldGetRevenueGrowth -> P1]
 *
 * - getActivityMetrics(int days)
 *   - paths: [P1: aggregate DAU, request logs, recent activity list, action distribution]
 *   - planned tests: [shouldGetActivityMetrics -> P1]
 *
 * - getTopCourses(int limit)
 *   - paths: [P1: fetch top courses by enrollment/rating]
 *   - planned tests: [shouldGetTopCourses -> P1]
 *
 * - getTopUsers(int limit)
 *   - paths: [P1: aggregate top students and top forum contributors]
 *   - planned tests: [shouldGetTopUsers -> P1]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for MetricServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify analytics aggregation, date range series gap filling, growth calculations,
 * and leaderboard generation in MetricServiceImpl.
 *
 * Test Scope
 * ----------
 * - getDashboardOverview()
 * - getUserGrowth()
 * - getCourseGrowth()
 * - getRevenueGrowth()
 * - getActivityMetrics()
 * - getTopCourses()
 * - getTopUsers()
 *
 * Covered Scenarios
 * -----------------
 * ✓ Dashboard overview metrics retrieval and calculations
 * ✓ Growth period calculations (DAILY, WEEKLY, MONTHLY, YEARLY)
 * ✓ Course and revenue time series generation
 * ✓ System activity telemetry and action distribution aggregation
 * ✓ Leaderboard lookups for courses and users
 *
 * Mocked Dependencies
 * -------------------
 * - MetricRepository
 */
@ExtendWith(MockitoExtension.class)
class MetricServiceImplTest {

    @Mock
    private MetricRepository metricRepository;

    @InjectMocks
    private MetricServiceImpl metricService;

    @Test
    @DisplayName("getDashboardOverview - should aggregate dashboard metrics from repository")
    void shouldGetDashboardOverview() {
        // Arrange
        when(metricRepository.countTotalUsers()).thenReturn(100L);
        when(metricRepository.countTotalCourses()).thenReturn(20L);
        when(metricRepository.countTotalLectures()).thenReturn(150L);
        when(metricRepository.countTotalAssignments()).thenReturn(50L);
        when(metricRepository.countTotalEnrollments()).thenReturn(300L);
        when(metricRepository.calculateTotalRevenue()).thenReturn(new BigDecimal("50000.00"));
        when(metricRepository.calculateCourseCompletionRate()).thenReturn(78.5);

        // Act
        DashboardOverviewDto overview = metricService.getDashboardOverview();

        // Assert
        assertThat(overview).isNotNull();
        assertThat(overview.getTotalUsers()).isEqualTo(100L);
        assertThat(overview.getTotalCourses()).isEqualTo(20L);
        assertThat(overview.getTotalLectures()).isEqualTo(150L);
        assertThat(overview.getTotalAssignments()).isEqualTo(50L);
        assertThat(overview.getTotalEnrollments()).isEqualTo(300L);
        assertThat(overview.getTotalRevenue()).isEqualTo(new BigDecimal("50000.00"));
        assertThat(overview.getCourseCompletionRate()).isEqualTo(78.5);
    }

    @Test
    @DisplayName("getUserGrowth - should calculate and fill missing dates for DAILY growth period")
    void shouldGetUserGrowthDaily() {
        // Arrange
        LocalDate today = LocalDate.now();
        GrowthDataDto rawSample = GrowthDataDto.builder().date(today).count(15L).build();
        when(metricRepository.getUserGrowth(eq(GrowthPeriod.DAILY), any())).thenReturn(List.of(rawSample));

        // Act
        List<GrowthDataDto> result = metricService.getUserGrowth(GrowthPeriod.DAILY);

        // Assert
        assertThat(result).hasSize(30);
        assertThat(result).extracting(GrowthDataDto::getDate).contains(today);
        GrowthDataDto todayDto = result.stream().filter(d -> d.getDate().equals(today)).findFirst().orElse(null);
        assertThat(todayDto).isNotNull();
        assertThat(todayDto.getCount()).isEqualTo(15L);
    }

    @Test
    @DisplayName("getUserGrowth - should calculate and fill missing dates for WEEKLY growth period")
    void shouldGetUserGrowthWeekly() {
        // Arrange
        when(metricRepository.getUserGrowth(eq(GrowthPeriod.WEEKLY), any())).thenReturn(List.of());

        // Act
        List<GrowthDataDto> result = metricService.getUserGrowth(GrowthPeriod.WEEKLY);

        // Assert
        assertThat(result).isNotEmpty();
        verify(metricRepository).getUserGrowth(eq(GrowthPeriod.WEEKLY), any());
    }

    @Test
    @DisplayName("getUserGrowth - should calculate and fill missing dates for MONTHLY growth period")
    void shouldGetUserGrowthMonthly() {
        // Arrange
        when(metricRepository.getUserGrowth(eq(GrowthPeriod.MONTHLY), any())).thenReturn(List.of());

        // Act
        List<GrowthDataDto> result = metricService.getUserGrowth(GrowthPeriod.MONTHLY);

        // Assert
        assertThat(result).isNotEmpty();
        verify(metricRepository).getUserGrowth(eq(GrowthPeriod.MONTHLY), any());
    }

    @Test
    @DisplayName("getUserGrowth - should calculate and fill missing dates for YEARLY growth period")
    void shouldGetUserGrowthYearly() {
        // Arrange
        when(metricRepository.getUserGrowth(eq(GrowthPeriod.YEARLY), any())).thenReturn(List.of());

        // Act
        List<GrowthDataDto> result = metricService.getUserGrowth(GrowthPeriod.YEARLY);

        // Assert
        assertThat(result).isNotEmpty();
        verify(metricRepository).getUserGrowth(eq(GrowthPeriod.YEARLY), any());
    }

    @Test
    @DisplayName("getCourseGrowth - should calculate and fill missing dates for course growth")
    void shouldGetCourseGrowth() {
        // Arrange
        LocalDate today = LocalDate.now();
        GrowthDataDto sample = GrowthDataDto.builder().date(today).count(5L).build();
        when(metricRepository.getCourseGrowth(eq(GrowthPeriod.DAILY), any())).thenReturn(List.of(sample));

        // Act
        List<GrowthDataDto> result = metricService.getCourseGrowth(GrowthPeriod.DAILY);

        // Assert
        assertThat(result).hasSize(30);
        GrowthDataDto todayDto = result.stream().filter(d -> d.getDate().equals(today)).findFirst().orElse(null);
        assertThat(todayDto).isNotNull();
        assertThat(todayDto.getCount()).isEqualTo(5L);
    }

    @Test
    @DisplayName("getRevenueGrowth - should calculate and fill missing dates for revenue growth")
    void shouldGetRevenueGrowth() {
        // Arrange
        LocalDate today = LocalDate.now();
        RevenueGrowthDto sample = RevenueGrowthDto.builder().date(today).amount(new BigDecimal("1200.50")).build();
        when(metricRepository.getRevenueGrowth(eq(GrowthPeriod.DAILY), any())).thenReturn(List.of(sample));

        // Act
        List<RevenueGrowthDto> result = metricService.getRevenueGrowth(GrowthPeriod.DAILY);

        // Assert
        assertThat(result).hasSize(30);
        RevenueGrowthDto todayDto = result.stream().filter(d -> d.getDate().equals(today)).findFirst().orElse(null);
        assertThat(todayDto).isNotNull();
        assertThat(todayDto.getAmount()).isEqualTo(new BigDecimal("1200.50"));
    }

    @Test
    @DisplayName("getActivityMetrics - should return aggregated activity metrics for specified days")
    void shouldGetActivityMetrics() {
        // Arrange
        int days = 30;
        when(metricRepository.countDailyActiveUsers(any())).thenReturn(45L);
        when(metricRepository.countTotalRequests(any())).thenReturn(1200L);
        RecentActivityDto activity = RecentActivityDto.builder().action("LOGIN").username("user1").build();
        when(metricRepository.getRecentActivities(10)).thenReturn(List.of(activity));
        when(metricRepository.getActionDistribution(any())).thenReturn(Map.of("LOGIN", 500L, "VIEW_LESSON", 700L));

        // Act
        ActivityMetricDto metrics = metricService.getActivityMetrics(days);

        // Assert
        assertThat(metrics).isNotNull();
        assertThat(metrics.getDailyActiveUsers()).isEqualTo(45L);
        assertThat(metrics.getTotalRequestLogs()).isEqualTo(1200L);
        assertThat(metrics.getRecentActivities()).containsExactly(activity);
        assertThat(metrics.getActionDistribution()).containsEntry("LOGIN", 500L);
    }

    @Test
    @DisplayName("getTopCourses - should return list of top courses up to limit")
    void shouldGetTopCourses() {
        // Arrange
        int limit = 10;
        TopCourseDto course = TopCourseDto.builder().title("Java Masterclass").build();
        when(metricRepository.getTopCourses(limit)).thenReturn(List.of(course));

        // Act
        List<TopCourseDto> topCourses = metricService.getTopCourses(limit);

        // Assert
        assertThat(topCourses).containsExactly(course);
        verify(metricRepository).getTopCourses(limit);
    }

    @Test
    @DisplayName("getTopUsers - should return top students and top contributors")
    void shouldGetTopUsers() {
        // Arrange
        int limit = 5;
        TopStudentDto student = TopStudentDto.builder().username("student1").build();
        TopContributorDto contributor = TopContributorDto.builder().username("author1").build();
        when(metricRepository.getTopStudents(limit)).thenReturn(List.of(student));
        when(metricRepository.getTopContributors(limit)).thenReturn(List.of(contributor));

        // Act
        TopUserDto topUsers = metricService.getTopUsers(limit);

        // Assert
        assertThat(topUsers).isNotNull();
        assertThat(topUsers.getTopStudents()).containsExactly(student);
        assertThat(topUsers.getTopContributors()).containsExactly(contributor);
    }
}
