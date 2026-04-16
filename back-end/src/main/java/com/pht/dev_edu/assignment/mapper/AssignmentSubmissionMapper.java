package com.pht.dev_edu.assignment.mapper;

import com.pht.dev_edu.assignment.dto.SubmissionRequest;
import com.pht.dev_edu.assignment.dto.SubmissionResponse;
import com.pht.dev_edu.assignment.entity.SubmissionEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AssignmentSubmissionMapper {
    SubmissionResponse entityToResponse(SubmissionEntity submission);

    @Mapping(target = "submittedAt", ignore = true)
    @Mapping(target = "studentUsername", ignore = true)
    @Mapping(target = "id", ignore = true)
    SubmissionEntity reqToEntity(SubmissionRequest submission);
}
