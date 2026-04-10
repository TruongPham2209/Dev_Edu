package com.pht.dev_edu.assignment.service;

import com.pht.dev_edu.assignment.dto.AssignmentRequest;
import com.pht.dev_edu.assignment.dto.AssignmentResponse;
import com.pht.dev_edu.assignment.mapper.AssignmentMapper;
import com.pht.dev_edu.assignment.repo.AssignmentRepository;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AssignmentServiceImpl implements AssignmentService {
    AssignmentRepository assignmentRepository;
    AssignmentPermissionService assignmentPermissionService;
    AssignmentMapper assignmentMapper;

    @Override
    public List<AssignmentResponse> getAssignments(Set<String> authorities, String actor, UUID lectureId) {
        assignmentPermissionService.checkViewAssignmentPermissionByAssignment(authorities, actor, lectureId);
        return List.of();
    }

    @Override
    @Transactional
    public AssignmentResponse create(Set<String> authorities, String author, AssignmentRequest req) {
        assignmentPermissionService.checkModifyAssignmentPermission(authorities, author, req.getLectureId());
        var assignment = assignmentMapper.reqToEntity(req);
        assignmentRepository.save(assignment);
//        send tracking to kafka

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

        // Send tracking to kafka
    }
}
