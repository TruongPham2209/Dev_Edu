package com.pht.dev_edu.quiz.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Named;

import com.pht.dev_edu.quiz.dto.response.QuizAssignmentResponse;
import com.pht.dev_edu.quiz.dto.response.QuizQuestionOptionResponse;
import com.pht.dev_edu.quiz.dto.response.QuizQuestionResponse;
import com.pht.dev_edu.quiz.dto.response.QuizResponse;
import com.pht.dev_edu.quiz.dto.response.QuizTypeConfigResponse;
import com.pht.dev_edu.quiz.entity.QuizAssignmentEntity;
import com.pht.dev_edu.quiz.entity.QuizEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionOptionEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionTypeConfigEntity;

@Mapper(componentModel = "spring")
@Named("quizMapper")
public interface QuizMapper {
    QuizResponse toResponse(QuizEntity entity);

    QuizTypeConfigResponse toResponse(QuizQuestionTypeConfigEntity entity);

    List<QuizTypeConfigResponse> toTypeConfigResponseList(List<QuizQuestionTypeConfigEntity> entities);

    QuizQuestionResponse toResponse(QuizQuestionEntity entity);

    QuizQuestionOptionResponse toResponse(QuizQuestionOptionEntity entity);

    List<QuizQuestionOptionResponse> toOptionResponseList(List<QuizQuestionOptionEntity> entities);

    QuizAssignmentResponse toResponse(QuizAssignmentEntity entity);
}
