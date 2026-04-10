package com.pht.dev_edu.assignment.mapper;

import com.pht.dev_edu.assignment.dto.AssignmentRequest;
import com.pht.dev_edu.assignment.dto.AssignmentResponse;
import com.pht.dev_edu.assignment.entity.AssignmentEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AssignmentMapper {
    AssignmentEntity reqToEntity(AssignmentRequest assignment);

    AssignmentResponse entityToRes(AssignmentEntity assignment);
}
