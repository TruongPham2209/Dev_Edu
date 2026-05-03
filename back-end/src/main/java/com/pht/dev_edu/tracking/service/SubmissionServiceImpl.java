package com.pht.dev_edu.tracking.service;

import com.pht.dev_edu.assignment.dto.SubmissionEvent;
import com.pht.dev_edu.assignment.dto.SubmissionLogResponse;
import com.pht.dev_edu.assignment.service.AssignmentPermissionService;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.common.util.TransactionUtils;
import com.pht.dev_edu.tracking.entity.SubmissionTrackingEntity;
import com.pht.dev_edu.tracking.mapper.SubmissionTrackingMapper;
import com.pht.dev_edu.tracking.repo.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Executor;

@Slf4j
@Service("submissionTrackingService")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class SubmissionServiceImpl implements SubmissionService {
    SubmissionRepository submissionRepository;
    AssignmentPermissionService assignmentPermissionService;

    SubmissionTrackingMapper submissionMapper;
    Executor executor;

    @Override
    public CustomPaging<SubmissionLogResponse> getSubmissionLogsByAssignmentIdForStudent(Set<String> authorities, String actor, String studentUsername, UUID assignmentId, int page) {
        assignmentPermissionService.checkViewAssignmentPermissionByAssignment(authorities, actor, assignmentId);
        var pageable = PageRequest.of(page, 10, Sort.by(Sort.Direction.DESC, "updatedAt"));
        var submissionPage = submissionRepository.findByAssignmentIdAndActor(assignmentId, studentUsername, pageable);

        return new CustomPaging<>(submissionPage, submissionMapper::entityToResponse);
    }

    @Override
    @Transactional
    public void saveSubmissionLog(SubmissionEvent submissionEvent) {
        String details = submissionEvent.getAction() == SubmissionEvent.Action.SUBMITTED
                ? String.format("Submitted object key: %s", submissionEvent.getFullObjectKey())
                : "Unsubmitted";
        SubmissionTrackingEntity submissionEntity = SubmissionTrackingEntity.builder()
                .assignmentId(submissionEvent.getAssignmentId())
                .actor(submissionEvent.getUsername())
                .updatedAt(submissionEvent.getTimestamp())
                .status(submissionEvent.getAction())
                .details(details)
                .build();
        submissionRepository.save(submissionEntity);

        if (submissionEvent.getAction() == SubmissionEvent.Action.UNSUBMITTED) {
            TransactionUtils.runAfterCommitAsync(() -> {
                KafkaUtils.sendDeleteFileEvent(submissionEvent.getFullObjectKey());
            }, executor);
        }
    }
}
