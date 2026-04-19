package com.pht.dev_edu.tracking.service;

import com.pht.dev_edu.tracking.dto.CronJobEvent;
import com.pht.dev_edu.tracking.dto.RequestLoggingEvent;
import com.pht.dev_edu.tracking.dto.TrackingEvent;

public interface LogService {
    void saveTrackingLog(TrackingEvent trackingEvent);

    void saveCronJobLog(CronJobEvent cronJobEvent);

    void saveRequestLog(RequestLoggingEvent requestLoggingEvent);
}
