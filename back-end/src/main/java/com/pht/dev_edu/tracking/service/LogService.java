package com.pht.dev_edu.tracking.service;

import com.pht.dev_edu.tracking.dto.TrackingEvent;

public interface LogService {
    void saveLog(TrackingEvent trackingEvent);
}
