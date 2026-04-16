package com.pht.dev_edu.assignment.service;

import com.pht.dev_edu.assignment.dto.AssignmentRequest;
import com.pht.dev_edu.assignment.dto.AssignmentResponse;
import com.pht.dev_edu.assignment.entity.AssignmentEntity;
import com.pht.dev_edu.assignment.mapper.AssignmentMapper;
import com.pht.dev_edu.assignment.repo.AssignmentRepository;
import com.pht.dev_edu.common.constant.EventTrackingConstant;
import com.pht.dev_edu.common.constant.KafkaTopicConstant;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.dto.TrackingEvent;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
    KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public List<AssignmentResponse> getAssignments(Set<String> authorities, String actor, UUID lectureId) {
        assignmentPermissionService.checkViewAssignmentPermissionByAssignment(authorities, actor, lectureId);
        var assignments = authorities.contains(RoleEnum.STUDENT.name())
                ? new ArrayList<AssignmentEntity>() // Call repository để lấy dữ liệu với projection, sau đó map sang entity
                : assignmentRepository.findByLectureIdAndDeletedAtIsNull(lectureId);
        return assignments.stream().map(assignmentMapper::entityToRes).toList();
    }

    @Override
    @Transactional
    public AssignmentResponse create(Set<String> authorities, String author, AssignmentRequest req) {
        assignmentPermissionService.checkModifyAssignmentPermission(authorities, author, req.getLectureId());
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

        var tracking = TrackingEvent.builder()
                .username(actor)
                .action(EventTrackingConstant.ASSIGNMENT_DELETED)
                .aggregateId(assignmentId)
                .details("Deleted assignment with id: " + assignmentId)
                .build();
        kafkaTemplate.send(KafkaTopicConstant.TRACKING_EVENT_TOPIC, tracking);
    }
}
