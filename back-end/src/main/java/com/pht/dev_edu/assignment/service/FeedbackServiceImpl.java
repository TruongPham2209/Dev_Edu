package com.pht.dev_edu.assignment.service;

import com.pht.dev_edu.assignment.dto.FeedbackRequest;
import com.pht.dev_edu.assignment.dto.FeedbackResponse;
import com.pht.dev_edu.assignment.mapper.FeedbackMapper;
import com.pht.dev_edu.assignment.repo.FeedbackRepository;
import com.pht.dev_edu.assignment.repo.SubmissionRepository;
import com.pht.dev_edu.common.constant.EventTrackingConstant;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.tracking.dto.TrackingEvent;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class FeedbackServiceImpl implements FeedbackService {
    SubmissionRepository submissionRepository;
    FeedbackRepository feedbackRepository;

    AssignmentPermissionService assignmentPermissionService;
    FeedbackMapper feedbackMapper;
    KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public List<FeedbackResponse> getFeedbacksBySubmission(Set<String> authorities, String actor, UUID submissionId) {
        var submission = submissionRepository.findById(submissionId).orElseThrow(
                () -> new DataNotFoundException("Submission not found.")
        );

        assignmentPermissionService.checkViewAssignmentPermissionByAssignment(authorities, actor, submission.getAssignmentId());
        var feedbacks = feedbackRepository.findBySubmissionId(submissionId);
        return feedbacks.stream().map(feedbackMapper::entityToRes).toList();
    }

    @Override
    @Transactional
    public FeedbackResponse create(Set<String> authorities, String author, FeedbackRequest req) {
        var submission = submissionRepository.findById(req.getSubmissionId()).orElseThrow(
                () -> new DataNotFoundException("Submission not found.")
        );

        assignmentPermissionService.checkModifyAssignmentPermission(authorities, author, submission.getAssignmentId());
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

        var submission = submissionRepository.findById(feedback.getSubmissionId()).orElseThrow(
                () -> new DataNotFoundException("Submission not found.")
        );

        assignmentPermissionService.checkModifyAssignmentPermission(authorities, actor, submission.getAssignmentId());

        var tracking = TrackingEvent.builder()
                .action(EventTrackingConstant.FEEDBACK_DELETED)
                .aggregateId(feedbackId)
                .details("Feedback deleted content: " + feedback.getFeedback())
                .username(actor)
                .build();

        feedbackRepository.delete(feedback);
        kafkaTemplate.send(KafkaTopicConstant.TRACKING_EVENT_TOPIC, tracking);
    }
}
