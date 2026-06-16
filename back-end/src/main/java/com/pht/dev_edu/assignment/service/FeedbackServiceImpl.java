package com.pht.dev_edu.assignment.service;

import com.pht.dev_edu.assignment.dto.FeedbackRequest;
import com.pht.dev_edu.assignment.dto.FeedbackResponse;
import com.pht.dev_edu.assignment.mapper.FeedbackMapper;
import com.pht.dev_edu.assignment.repo.FeedbackRepository;
import com.pht.dev_edu.common.constant.EventTrackingConstant;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.common.util.TransactionUtils;
import com.pht.dev_edu.tracking.dto.TrackingEvent;
import com.pht.dev_edu.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Executor;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class FeedbackServiceImpl implements FeedbackService {
    FeedbackRepository feedbackRepository;
    UserRepository userRepository;

    AssignmentPermissionService assignmentPermissionService;
    FeedbackMapper feedbackMapper;
    Executor executor;

    @Override
    public List<FeedbackResponse> getFeedbacksByAssignment(Set<String> authorities, String actor, UUID assignmentId, String studentUsername) {
        assignmentPermissionService.checkViewAssignmentPermissionByAssignment(authorities, actor, assignmentId);
        var feedbacks = feedbackRepository.findByAssignmentIdAndStudentUsername(assignmentId, studentUsername);
        return feedbacks.stream().map(feedbackMapper::projectionToRes).toList();
    }

    @Override
    @Transactional
    public FeedbackResponse create(Set<String> authorities, String author, FeedbackRequest req) {
        if (!userRepository.existsByUsername(req.getStudentUsername())) {
            throw new DataNotFoundException("Student not found.");
        }

        assignmentPermissionService.checkModifyAssignmentPermission(authorities, author, req.getAssignmentId());
        var feedbackEntity = feedbackMapper.reqToEntity(req);
        feedbackEntity.setLecturer(author);
        feedbackRepository.save(feedbackEntity);

        return feedbackMapper.entityToRes(feedbackEntity);
    }

    @Override
    @Transactional
    public void delete(Set<String> authorities, String actor, UUID feedbackId) {
        var feedback = feedbackRepository.findById(feedbackId).orElseThrow(
                () -> new DataNotFoundException("Feedback not found.")
        );

        assignmentPermissionService.checkModifyAssignmentPermission(authorities, actor, feedback.getAssignmentId());

        TransactionUtils.runAfterCommitAsync(() -> {
            var tracking = TrackingEvent.builder()
                    .action(EventTrackingConstant.FEEDBACK_DELETED)
                    .aggregateId(feedbackId)
                    .details("Feedback deleted content: " + feedback.getFeedback())
                    .username(actor)
                    .build();
            KafkaUtils.sendTrackingEvent(tracking);
        }, executor);

        feedbackRepository.delete(feedback);
    }
}
