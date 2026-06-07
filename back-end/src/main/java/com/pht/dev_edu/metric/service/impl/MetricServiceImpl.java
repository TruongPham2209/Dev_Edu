package com.pht.dev_edu.metric.service.impl;

import com.pht.dev_edu.metric.dto.*;
import com.pht.dev_edu.metric.repo.MetricRepository;
import com.pht.dev_edu.metric.service.MetricService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class MetricServiceImpl implements MetricService {
    MetricRepository metricRepository;

    @Override
    public DashboardOverviewDto getDashboardOverview() {
        return DashboardOverviewDto.builder()
                .totalUsers(metricRepository.countTotalUsers())
                .totalCourses(metricRepository.countTotalCourses())
                .totalLectures(metricRepository.countTotalLectures())
                .totalAssignments(metricRepository.countTotalAssignments())
                .totalEnrollments(metricRepository.countTotalEnrollments())
                .totalRevenue(metricRepository.calculateTotalRevenue())
                .courseCompletionRate(metricRepository.calculateCourseCompletionRate())
                .build();
    }

    @Override
    public List<GrowthDataDto> getUserGrowth(GrowthPeriod period) {
        LocalDateTime since = getSinceDateForPeriod(period);
        List<GrowthDataDto> rawData = metricRepository.getUserGrowth(period, since);
        return fillMissingDatesForGrowth(rawData, period);
    }

    @Override
    public List<GrowthDataDto> getCourseGrowth(GrowthPeriod period) {
        LocalDateTime since = getSinceDateForPeriod(period);
        List<GrowthDataDto> rawData = metricRepository.getCourseGrowth(period, since);
        return fillMissingDatesForGrowth(rawData, period);
    }

    @Override
    public List<RevenueGrowthDto> getRevenueGrowth(GrowthPeriod period) {
        LocalDateTime since = getSinceDateForPeriod(period);
        List<RevenueGrowthDto> rawData = metricRepository.getRevenueGrowth(period, since);
        return fillMissingDatesForRevenue(rawData, period);
    }

    @Override
    public ActivityMetricDto getActivityMetrics(int days) {
        LocalDateTime since = LocalDate.now().minusDays(days - 1).atStartOfDay();
        return ActivityMetricDto.builder()
                .dailyActiveUsers(metricRepository.countDailyActiveUsers(since))
                .totalRequestLogs(metricRepository.countTotalRequests(since))
                .recentActivities(metricRepository.getRecentActivities(10))
                .actionDistribution(metricRepository.getActionDistribution(since))
                .build();
    }

    @Override
    public List<TopCourseDto> getTopCourses(int limit) {
        return metricRepository.getTopCourses(limit);
    }

    @Override
    public TopUserDto getTopUsers(int limit) {
        return TopUserDto.builder()
                .topStudents(metricRepository.getTopStudents(limit))
                .topContributors(metricRepository.getTopContributors(limit))
                .build();
    }

    private LocalDateTime getSinceDateForPeriod(GrowthPeriod period) {
        LocalDate end = LocalDate.now();
        LocalDate start = switch (period) {
            case DAILY -> end.minusDays(29);
            case WEEKLY -> end.minusWeeks(11).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            case MONTHLY -> end.minusMonths(11).withDayOfMonth(1);
            case YEARLY -> end.minusYears(4).withDayOfYear(1);
        };
        return start.atStartOfDay();
    }

    private List<GrowthDataDto> fillMissingDatesForGrowth(List<GrowthDataDto> rawData, GrowthPeriod period) {
        Map<LocalDate, Long> map = new TreeMap<>();
        LocalDate end = LocalDate.now();
        LocalDate start;

        switch (period) {
            case DAILY -> {
                start = end.minusDays(29);
                for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
                    map.put(date, 0L);
                }
            }
            case WEEKLY -> {
                start = end.minusWeeks(11).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                for (LocalDate date = start; !date.isAfter(end); date = date.plusWeeks(1)) {
                    map.put(date, 0L);
                }
            }
            case MONTHLY -> {
                start = end.minusMonths(11).withDayOfMonth(1);
                for (LocalDate date = start; !date.isAfter(end); date = date.plusMonths(1)) {
                    map.put(date, 0L);
                }
            }
            case YEARLY -> {
                start = end.minusYears(4).withDayOfYear(1);
                for (LocalDate date = start; !date.isAfter(end); date = date.plusYears(1)) {
                    map.put(date, 0L);
                }
            }
        }

        for (GrowthDataDto data : rawData) {
            if (map.containsKey(data.getDate())) {
                map.put(data.getDate(), data.getCount());
            }
        }

        return map.entrySet().stream()
                .map(e -> GrowthDataDto.builder()
                        .date(e.getKey())
                        .count(e.getValue())
                        .build())
                .toList();
    }

    private List<RevenueGrowthDto> fillMissingDatesForRevenue(List<RevenueGrowthDto> rawData, GrowthPeriod period) {
        Map<LocalDate, BigDecimal> map = new TreeMap<>();
        LocalDate end = LocalDate.now();
        LocalDate start;

        switch (period) {
            case DAILY -> {
                start = end.minusDays(29);
                for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
                    map.put(date, BigDecimal.ZERO);
                }
            }
            case WEEKLY -> {
                start = end.minusWeeks(11).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                for (LocalDate date = start; !date.isAfter(end); date = date.plusWeeks(1)) {
                    map.put(date, BigDecimal.ZERO);
                }
            }
            case MONTHLY -> {
                start = end.minusMonths(11).withDayOfMonth(1);
                for (LocalDate date = start; !date.isAfter(end); date = date.plusMonths(1)) {
                    map.put(date, BigDecimal.ZERO);
                }
            }
            case YEARLY -> {
                start = end.minusYears(4).withDayOfYear(1);
                for (LocalDate date = start; !date.isAfter(end); date = date.plusYears(1)) {
                    map.put(date, BigDecimal.ZERO);
                }
            }
        }

        for (RevenueGrowthDto data : rawData) {
            if (map.containsKey(data.getDate())) {
                map.put(data.getDate(), data.getAmount());
            }
        }

        return map.entrySet().stream()
                .map(e -> RevenueGrowthDto.builder()
                        .date(e.getKey())
                        .amount(e.getValue())
                        .build())
                .toList();
    }
}
