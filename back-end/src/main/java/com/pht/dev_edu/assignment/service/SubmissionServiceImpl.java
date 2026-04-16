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
import com.pht.dev_edu.file.dto.FileDeleteEvent;
import com.pht.dev_edu.file.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

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

    @Override
    public CustomPaging<SubmissionResponse> getSubmissionsByAssignment(Set<String> authorities, String actor, UUID assignmentId, int page, int size) {
        assignmentPermissionService.checkViewAssignmentPermissionByAssignment(authorities, actor, assignmentId);
        return null;
    }

    @Override
    @Transactional
    public SubmissionResponse submit(String studentUsername, SubmissionRequest req) {
        assignmentPermissionService.checkViewAssignmentPermissionByAssignment(Set.of(RoleEnum.STUDENT.name()), studentUsername, req.getAssignmentId());
        validateSubmissionFile(studentUsername, req.getFileObjectKey());

        var submission = submissionMapper.reqToEntity(req);
        submission.setStudentUsername(studentUsername);
        submissionRepository.save(submission);

        var submissionEvent = SubmissionEvent.builder()
                .fullObjectKey(req.getFileObjectKey())
                .action(SubmissionEvent.Action.SUBMITTED)
                .assignmentId(req.getAssignmentId())
                .username(studentUsername)
                .build();
        kafkaTemplate.send(KafkaTopicConstant.SUBMISSION_EVENT_TOPIC, submissionEvent);
        return submissionMapper.entityToResponse(submission);
    }

    @Override
    @Transactional
    public void unSubmit(String studentUsername, UUID submissionId) {
        var submission = submissionRepository.findById(submissionId).orElseThrow(
                () -> new DataNotFoundException("Submission not found.")
        );

        if (!submission.getStudentUsername().equals(studentUsername)) {
            throw new DataNotFoundException("Submission not found.");
        }

        submissionRepository.delete(submission);

        var submissionEvent = SubmissionEvent.builder()
                .fullObjectKey(submission.getFileObjectKey())
                .action(SubmissionEvent.Action.UNSUBMITTED)
                .assignmentId(submission.getAssignmentId())
                .username(studentUsername)
                .build();
        kafkaTemplate.send(KafkaTopicConstant.SUBMISSION_EVENT_TOPIC, submissionEvent);
    }

    private void validateSubmissionFile(String author, String objectKey) {
        var fileInfo = fileService.getFileInfo(author, objectKey);
//        boolean isValidContentType = fileInfo.getContentType().equals("application/pdf") ||
//                                     fileInfo.getContentType().equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        boolean isValidContentType = true;
//        if (!isValidContentType) {
        var deleteFileEvent = FileDeleteEvent.builder()
                .fullObjectKey(objectKey)
                .build();
        kafkaTemplate.send(KafkaTopicConstant.FILE_DELETE_TOPIC, deleteFileEvent);

        log.error("Invalid file type for submission. Author: {}, ObjectKey: {}, ContentType: {}", author, objectKey, fileInfo.getContentType());
        throw new BadRequestException("Invalid file type.");
//        }
    }
}
