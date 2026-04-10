package com.pht.dev_edu.tracking.service;

import com.pht.dev_edu.common.dto.TrackingEvent;
import com.pht.dev_edu.tracking.entity.LogEntity;
import com.pht.dev_edu.tracking.repo.LogRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class LogServiceImpl implements LogService {
    LogRepository logRepository;

    @Override
    @Transactional
    public void saveLog(TrackingEvent trackingEvent) {
        LogEntity logEntity = LogEntity.builder()
                .username(trackingEvent.getUsername())
                .aggregateId(trackingEvent.getAggregateId())
                .action(trackingEvent.getAction())
                .details(trackingEvent.getDetails())
                .createdAt(trackingEvent.getTimestamp())
                .build();
        logRepository.save(logEntity);
    }
}
