package com.pht.dev_edu.assignment.service;

import com.pht.dev_edu.assignment.dto.FeedbackRequest;
import com.pht.dev_edu.assignment.dto.FeedbackResponse;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface FeedbackService {
    List<FeedbackResponse> getFeedbacksBySubmission(Set<String> authorities, String actor, UUID submissionId);

    FeedbackResponse create(Set<String> authorities, String author, FeedbackRequest req);

    void delete(Set<String> authorities, String actor, UUID feedbackId);
}
