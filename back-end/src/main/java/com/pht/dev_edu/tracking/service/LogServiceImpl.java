package com.pht.dev_edu.tracking.service;

import com.pht.dev_edu.tracking.dto.CronJobEvent;
import com.pht.dev_edu.tracking.dto.RequestLoggingEvent;
import com.pht.dev_edu.tracking.dto.TrackingEvent;
import com.pht.dev_edu.tracking.entity.LogCronJobEntity;
import com.pht.dev_edu.tracking.entity.LogRequestEntity;
import com.pht.dev_edu.tracking.entity.LogTrackingEntity;
import com.pht.dev_edu.tracking.repo.LogCronJobRepository;
import com.pht.dev_edu.tracking.repo.LogRepository;
import com.pht.dev_edu.tracking.repo.LogRequestRepository;
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
    LogCronJobRepository logCronJobRepository;
    LogRequestRepository logRequestRepository;

    @Override
    @Transactional
    public void saveTrackingLog(TrackingEvent trackingEvent) {
        LogTrackingEntity logEntity = LogTrackingEntity.builder()
                .username(trackingEvent.getUsername())
                .aggregateId(trackingEvent.getAggregateId())
                .action(trackingEvent.getAction())
                .details(trackingEvent.getDetails())
                .createdAt(trackingEvent.getTimestamp())
                .build();
        logRepository.save(logEntity);
    }

    @Override
    @Transactional
    public void saveCronJobLog(CronJobEvent cronJobEvent) {
        LogCronJobEntity logEntity = LogCronJobEntity.builder()
                .name(cronJobEvent.getCronJobName())
                .status(cronJobEvent.getStatus())
                .detail(cronJobEvent.getDetails())
                .createdAt(cronJobEvent.getStartTime())
                .errorMessage(cronJobEvent.getErrorMessage())
                .errorStacktrace(cronJobEvent.getErrorStackTrace())
                .finishedAt(cronJobEvent.getFinishedTime())
                .build();
        logCronJobRepository.save(logEntity);
    }

    @Override
    @Transactional
    public void saveRequestLog(RequestLoggingEvent requestLoggingEvent) {
        LogRequestEntity logEntity = LogRequestEntity.builder()
                .username(requestLoggingEvent.getUsername())
                .method(requestLoggingEvent.getMethod())
                .uri(requestLoggingEvent.getUri())
                .requestBody(requestLoggingEvent.getRequestBody())
                .responseBody(requestLoggingEvent.getResponseBody())
                .timestamp(requestLoggingEvent.getTimestamp())
                .build();
        logRequestRepository.save(logEntity);
    }
}
