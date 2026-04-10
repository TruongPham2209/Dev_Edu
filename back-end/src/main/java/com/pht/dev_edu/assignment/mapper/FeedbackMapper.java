package com.pht.dev_edu.assignment.mapper;

import com.pht.dev_edu.assignment.dto.FeedbackRequest;
import com.pht.dev_edu.assignment.dto.FeedbackResponse;
import com.pht.dev_edu.assignment.entity.FeedbackEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FeedbackMapper {
    FeedbackEntity reqToEntity(FeedbackRequest req);

    FeedbackResponse entityToRes(FeedbackEntity entity);
}
