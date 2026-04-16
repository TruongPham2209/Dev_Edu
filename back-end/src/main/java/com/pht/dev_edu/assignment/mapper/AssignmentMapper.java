package com.pht.dev_edu.assignment.mapper;

import com.pht.dev_edu.assignment.dto.AssignmentRequest;
import com.pht.dev_edu.assignment.dto.AssignmentResponse;
import com.pht.dev_edu.assignment.entity.AssignmentEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AssignmentMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    AssignmentEntity reqToEntity(AssignmentRequest assignment);


    @Mapping(target = "submittedAt", ignore = true)
    @Mapping(target = "fileObjectKey", ignore = true)
    AssignmentResponse entityToRes(AssignmentEntity assignment);
}
