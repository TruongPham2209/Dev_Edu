package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.quiz.dto.request.*;
import com.pht.dev_edu.quiz.dto.response.*;

import java.util.List;
import java.util.UUID;

public interface QuizAttemptService {
    StartAttemptResponse startAttempt(UUID assignmentId, String username, String sessionToken);

    AutosaveResponse autosaveAnswer(UUID attemptId, AutosaveRequest request, String username);

    SubmitAttemptResponse submitAttempt(UUID attemptId, String username);

    void heartbeat(UUID attemptId, HeartbeatRequest request, String username);

    AttemptResultResponse getAttemptResult(UUID attemptId, String username, boolean isStaff);

    StartAttemptResponse getAttemptById(UUID attemptId, String username, boolean isStaff);

    QuizAttemptReviewResponse getAttemptReview(UUID attemptId, String username, boolean isStaff);

    List<SubmitAttemptResponse> getStudentAttemptHistory(UUID assignmentId, String username);
}
