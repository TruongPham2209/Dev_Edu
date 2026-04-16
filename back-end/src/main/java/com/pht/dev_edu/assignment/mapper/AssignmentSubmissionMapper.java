package com.pht.dev_edu.assignment.mapper;

import com.pht.dev_edu.assignment.dto.SubmissionRequest;
import com.pht.dev_edu.assignment.dto.SubmissionResponse;
import com.pht.dev_edu.assignment.entity.SubmissionEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AssignmentSubmissionMapper {
    SubmissionResponse entityToResponse(SubmissionEntity submission);

    SubmissionEntity reqToEntity(SubmissionRequest submission);
}
