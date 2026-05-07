package com.pht.dev_edu.assignment.service;

import com.pht.dev_edu.assignment.dto.SubmissionEvent;
import com.pht.dev_edu.assignment.dto.SubmissionRequest;
import com.pht.dev_edu.assignment.dto.SubmissionResponse;
import com.pht.dev_edu.assignment.mapper.AssignmentSubmissionMapper;
import com.pht.dev_edu.assignment.repo.SubmissionRepository;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.FileContentTypeUtils;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.common.util.TransactionUtils;
import com.pht.dev_edu.file.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Executor;

@Slf4j
@Service("assignmentSubmissionService")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class SubmissionServiceImpl implements SubmissionService {
    SubmissionRepository submissionRepository;

    AssignmentPermissionService assignmentPermissionService;
    FileService fileService;

    AssignmentSubmissionMapper submissionMapper;
    KafkaTemplate<String, Object> kafkaTemplate;
    Executor executor;

    @Override
    public CustomPaging<SubmissionResponse> getSubmissionsByAssignment(Set<String> authorities, String actor, UUID assignmentId, int page, int size) {
        assignmentPermissionService.checkModifyAssignmentPermission(authorities, actor, assignmentId);
        var pageable = PageRequest.of(page, size, Sort.by("submittedAt").descending());
        var submissionPage = submissionRepository.findByAssignmentIdOrderBySubmittedAtDesc(assignmentId, pageable);
        return new CustomPaging<>(submissionPage, submissionMapper::entityToResponse);
    }

    @Override
    @Transactional
    public SubmissionResponse submit(String studentUsername, SubmissionRequest req) {
        assignmentPermissionService.checkViewAssignmentPermissionByAssignment(Set.of(RoleEnum.STUDENT.name()), studentUsername, req.getAssignmentId());
        validateSubmissionFile(studentUsername, req.getFileObjectKey());

        var submission = submissionMapper.reqToEntity(req);
        submission.setStudentUsername(studentUsername);
        submissionRepository.save(submission);

        TransactionUtils.runAfterCommitAsync(() -> {
            var submissionEvent = SubmissionEvent.builder()
                    .fullObjectKey(req.getFileObjectKey())
                    .action(SubmissionEvent.Action.SUBMITTED)
                    .assignmentId(req.getAssignmentId())
                    .username(studentUsername)
                    .build();
            kafkaTemplate.send(KafkaTopicConstant.SUBMISSION_EVENT_TOPIC, submissionEvent);
        }, executor);

        return submissionMapper.entityToResponse(submission);
    }

    @Override
    @Transactional
    public void unSubmit(String studentUsername, UUID assignmentId) {
        var submission = submissionRepository.findByAssignmentIdAndStudentUsername(assignmentId, studentUsername).orElseThrow(
                () -> new DataNotFoundException("Submission not found.")
        );

        submissionRepository.delete(submission);

        TransactionUtils.runAfterCommitAsync(() -> {
            var submissionEvent = SubmissionEvent.builder()
                    .fullObjectKey(submission.getFileObjectKey())
                    .action(SubmissionEvent.Action.UNSUBMITTED)
                    .assignmentId(submission.getAssignmentId())
                    .username(studentUsername)
                    .build();
            kafkaTemplate.send(KafkaTopicConstant.SUBMISSION_EVENT_TOPIC, submissionEvent);
        }, executor);
    }

    private void validateSubmissionFile(String author, String objectKey) {
        var fileInfo = fileService.getFileInfo(author, objectKey);
        boolean isValidContentType = FileContentTypeUtils.isValidContentType(fileInfo.getContentType(), FileContentTypeUtils.FileType.DOCUMENT, FileContentTypeUtils.FileType.ARCHIVE);

        if (isValidContentType) {
            return;
        }

        KafkaUtils.sendDeleteFileEvent(objectKey);

        log.error("Invalid file type for submission. Author: {}, ObjectKey: {}, ContentType: {}", author, objectKey, fileInfo.getContentType());
        throw new BadRequestException("Invalid file type.");
    }
}
