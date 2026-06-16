package com.pht.dev_edu.assignment.mapper;

import com.pht.dev_edu.assignment.dto.FeedbackProjection;
import com.pht.dev_edu.assignment.dto.FeedbackRequest;
import com.pht.dev_edu.assignment.dto.FeedbackResponse;
import com.pht.dev_edu.assignment.entity.FeedbackEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FeedbackMapper {
    @Mapping(target = "lecturer", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    FeedbackEntity reqToEntity(FeedbackRequest req);

    FeedbackResponse entityToRes(FeedbackEntity entity);

    FeedbackResponse projectionToRes(FeedbackProjection projection);
}
