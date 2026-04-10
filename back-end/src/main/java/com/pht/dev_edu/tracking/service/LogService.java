package com.pht.dev_edu.tracking.service;

import com.pht.dev_edu.common.dto.TrackingEvent;

public interface LogService {
    void saveLog(TrackingEvent trackingEvent);
}
