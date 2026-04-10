package com.pht.dev_edu.tracking.mapper;

import com.pht.dev_edu.assignment.dto.SubmissionLogResponse;
import com.pht.dev_edu.tracking.entity.SubmissionEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SubmissionMapper {
    SubmissionLogResponse entityToResponse(SubmissionEntity entity);
}
