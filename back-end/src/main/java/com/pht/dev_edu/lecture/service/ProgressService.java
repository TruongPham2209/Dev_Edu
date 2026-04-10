package com.pht.dev_edu.lecture.service;

import com.pht.dev_edu.lecture.dto.ProgressSegmentRequest;

public interface ProgressService {
    void updateProgress(String actor, ProgressSegmentRequest req);
}
