package com.pht.dev_edu.tracking.service;

import com.pht.dev_edu.tracking.dto.CronJobEvent;
import com.pht.dev_edu.tracking.dto.RequestLoggingEvent;
import com.pht.dev_edu.tracking.dto.TrackingEvent;

/**
 * Service for capturing and persisting system audit logs, telemetry events, cron job logs, and HTTP access logs.
 */
public interface LogService {

    /**
     * Persists a user behavioral tracking event (page views, clicks, video interactions).
     *
     * @param trackingEvent the {@link TrackingEvent} containing telemetry data.
     */
    void saveTrackingLog(TrackingEvent trackingEvent);

    /**
     * Persists a cron job execution telemetry event (start/end timestamp, status, error details).
     *
     * @param cronJobEvent the {@link CronJobEvent} containing scheduled job execution metrics.
     */
    void saveCronJobLog(CronJobEvent cronJobEvent);

    /**
     * Persists an HTTP request/response log for system monitoring and performance profiling.
     *
     * @param requestLoggingEvent the {@link RequestLoggingEvent} containing URI, method, duration, status code, and IP.
     */
    void saveRequestLog(RequestLoggingEvent requestLoggingEvent);
}
