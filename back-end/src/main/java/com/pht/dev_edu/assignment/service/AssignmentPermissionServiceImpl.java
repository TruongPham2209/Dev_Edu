package com.pht.dev_edu.assignment.service;

import com.pht.dev_edu.assignment.repo.AssignmentRepository;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.lecture.service.LecturePermissionService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AssignmentPermissionServiceImpl implements AssignmentPermissionService {
    LecturePermissionService lecturePermissionService;
    AssignmentRepository assignmentRepository;

    @Override
    public void checkViewAssignmentPermissionByLecture(Set<String> authorities, String actor, UUID lectureId) {
        lecturePermissionService.checkViewPermissionByLecture(authorities, actor, lectureId);
    }

    @Override
    public void checkViewAssignmentPermissionByAssignment(Set<String> authorities, String actor, UUID assignmentId) {
        var assignment = assignmentRepository.findById(assignmentId).orElseThrow(
                () -> new DataNotFoundException("Assignment not found.")
        );
        checkViewAssignmentPermissionByLecture(authorities, actor, assignment.getLectureId());
    }

    @Override
    public void checkModifyAssignmentPermission(Set<String> authorities, String actor, UUID assignmentId) {
        var assignment = assignmentRepository.findById(assignmentId).orElseThrow(
                () -> new DataNotFoundException("Assignment not found.")
        );

        if (authorities.contains(RoleEnum.ADMIN.name())) {
            return;
        }

        lecturePermissionService.checkModifyPermissionByLecture(authorities, actor, assignment.getLectureId());
    }

    @Override
    public void checkModifyAssignmentPermissionByLecture(Set<String> authorities, String actor, UUID lectureId) {
        lecturePermissionService.checkModifyPermissionByLecture(authorities, actor, lectureId);
    }
}
