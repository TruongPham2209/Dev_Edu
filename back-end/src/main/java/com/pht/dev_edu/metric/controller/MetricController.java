package com.pht.dev_edu.metric.controller;

import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.metric.dto.GrowthPeriod;
import com.pht.dev_edu.metric.service.MetricService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class MetricController {
    MetricService metricService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardOverview() {
        var data = metricService.getDashboardOverview();
        return ApiUtils.buildSuccessResponse(data);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/users-growth")
    public ResponseEntity<?> getUsersGrowth(
            @RequestParam(required = false, defaultValue = "DAILY") GrowthPeriod period
    ) {
        var data = metricService.getUserGrowth(period);
        return ApiUtils.buildSuccessResponse(data);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/courses-growth")
    public ResponseEntity<?> getCoursesGrowth(
            @RequestParam(required = false, defaultValue = "DAILY") GrowthPeriod period
    ) {
        var data = metricService.getCourseGrowth(period);
        return ApiUtils.buildSuccessResponse(data);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/revenue-growth")
    public ResponseEntity<?> getRevenueGrowth(
            @RequestParam(required = false, defaultValue = "DAILY") GrowthPeriod period
    ) {
        var data = metricService.getRevenueGrowth(period);
        return ApiUtils.buildSuccessResponse(data);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/activity")
    public ResponseEntity<?> getActivityMetrics(
            @RequestParam(required = false, defaultValue = "30") int days
    ) {
        var data = metricService.getActivityMetrics(days);
        return ApiUtils.buildSuccessResponse(data);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/top-courses")
    public ResponseEntity<?> getTopCourses(
            @RequestParam(required = false, defaultValue = "10") int limit
    ) {
        var data = metricService.getTopCourses(limit);
        return ApiUtils.buildSuccessResponse(data);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/top-users")
    public ResponseEntity<?> getTopUsers(
            @RequestParam(required = false, defaultValue = "10") int limit
    ) {
        var data = metricService.getTopUsers(limit);
        return ApiUtils.buildSuccessResponse(data);
    }
}
