package com.pht.dev_edu.assignment.service;

import com.pht.dev_edu.assignment.dto.AssignmentRequest;
import com.pht.dev_edu.assignment.dto.AssignmentResponse;
import com.pht.dev_edu.assignment.mapper.AssignmentMapper;
import com.pht.dev_edu.assignment.repo.AssignmentRepository;
import com.pht.dev_edu.assignment.repo.FeedbackRepository;
import com.pht.dev_edu.assignment.repo.SubmissionRepository;
import com.pht.dev_edu.common.constant.EventTrackingConstant;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.common.util.TransactionUtils;
import com.pht.dev_edu.tracking.dto.TrackingEvent;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Executor;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AssignmentServiceImpl implements AssignmentService {
    AssignmentRepository assignmentRepository;
    SubmissionRepository submissionRepository;
    FeedbackRepository feedbackRepository;

    Executor executor;
    AssignmentPermissionService assignmentPermissionService;
    AssignmentMapper assignmentMapper;

    @Override
    public List<AssignmentResponse> getAssignments(Set<String> authorities, String actor, UUID lectureId) {
        assignmentPermissionService.checkViewAssignmentPermissionByLecture(authorities, actor, lectureId);

        if (!authorities.contains(RoleEnum.STUDENT.name())) {
            var assignments = assignmentRepository.findByLectureIdAndDeletedAtIsNullOrderByCreatedAt(lectureId);
            return assignments.stream().map(assignmentMapper::entityToRes).toList();
        }

        var assignments = assignmentRepository.findByLectureIdAndStudentUsername(lectureId, actor);
        return assignments.stream().map(assignmentMapper::projectionToRes).toList();
    }

    @Override
    @Transactional
    public AssignmentResponse create(Set<String> authorities, String author, AssignmentRequest req) {
        assignmentPermissionService.checkModifyAssignmentPermissionByLecture(authorities, author, req.getLectureId());
        var assignment = assignmentMapper.reqToEntity(req);
        assignmentRepository.save(assignment);

        return assignmentMapper.entityToRes(assignment);
    }

    @Override
    @Transactional
    public void delete(Set<String> authorities, String actor, UUID assignmentId) {
        assignmentPermissionService.checkModifyAssignmentPermission(authorities, actor, assignmentId);
        var assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new DataNotFoundException("Assignment not found."));
        if (assignment.getDeletedAt() != null) {
            throw new DataNotFoundException("Assignment not found.");
        }
        assignment.setDeletedAt(LocalDateTime.now());
        assignmentRepository.save(assignment);

        TransactionUtils.runAfterCommitAsync(() -> {
            var tracking = TrackingEvent.builder()
                    .username(actor)
                    .action(EventTrackingConstant.ASSIGNMENT_DELETED)
                    .aggregateId(assignmentId)
                    .details("Deleted assignment with id: " + assignmentId)
                    .build();
            KafkaUtils.sendTrackingEvent(tracking);
        }, executor);
    }

    @Override
    @Transactional
    public void deleteById(UUID assignmentId) {
        deleteByIds(List.of(assignmentId));
    }

    @Override
    @Transactional
    public void deleteByIds(List<UUID> assignmentIds) {
        // Implement hard delete
        // assignment_submission (*) -> submission_feedback
        assignmentRepository.deleteAllById(assignmentIds);

        feedbackRepository.deleteByAssignmentIdIn(assignmentIds);
        var fileObjectKeys = submissionRepository.deleteByAssignmentIdInAndReturnObjectKeys(assignmentIds);

        TransactionUtils.runAfterCommitAsync(() -> {
            fileObjectKeys.forEach(KafkaUtils::sendDeleteFileEvent);
        }, executor);
    }
}
