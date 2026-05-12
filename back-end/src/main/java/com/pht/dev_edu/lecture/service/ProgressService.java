package com.pht.dev_edu.lecture.service;

import com.pht.dev_edu.lecture.dto.ProgressResponse;
import com.pht.dev_edu.lecture.dto.ProgressSegmentRequest;

public interface ProgressService {
    ProgressResponse updateProgress(String actor, ProgressSegmentRequest req);
}
