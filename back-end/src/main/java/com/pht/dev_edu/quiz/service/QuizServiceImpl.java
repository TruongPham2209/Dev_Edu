package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.common.constant.RedisDurationConstant;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.quiz.dto.response.QuizDetailResponse;
import com.pht.dev_edu.quiz.dto.response.QuizQuestionResponse;
import com.pht.dev_edu.quiz.entity.QuizEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionOptionEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionTypeConfigEntity;
import com.pht.dev_edu.quiz.mapper.QuizMapper;
import com.pht.dev_edu.quiz.repo.QuizQuestionOptionRepo;
import com.pht.dev_edu.quiz.repo.QuizQuestionRepo;
import com.pht.dev_edu.quiz.repo.QuizQuestionTypeConfigRepo;
import com.pht.dev_edu.quiz.repo.QuizRepo;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizServiceImpl implements QuizService {
    QuizRepo quizRepo;
    QuizQuestionTypeConfigRepo typeConfigRepo;
    QuizQuestionRepo questionRepo;
    QuizQuestionOptionRepo optionRepo;
    QuizMapper quizMapper;

    @Override
    public QuizEntity getQuizEntityOrThrow(UUID quizId) {
        var quiz = getQuizEntity(quizId);

        if (quiz == null) {
            log.error("Quiz with id {} is not found", quizId);
            throw new DataNotFoundException("Quiz not found");
        }

        if (quiz.getDeletedAt() != null) {
            log.warn("Quiz with id {} is deleted and cannot be accessed", quizId);
            throw new DataNotFoundException("Quiz not found");
        }
        return quiz;
    }

    @Override
    public QuizEntity getQuizEntity(UUID quizId) {
        return RedisUtils.getOptionalDataFromCacheOrDb(
                RedisPrefixConstant.QUIZ_PREFIX + quizId,
                QuizEntity.class,
                () -> quizRepo.findById(quizId),
                RedisDurationConstant.QUIZ_DATA_DURATION);
    }

    @Override
    public QuizDetailResponse getQuizDetailResponseFromCache(UUID quizId) {
        return RedisUtils.getDataFromCacheOrDb(
                RedisPrefixConstant.QUIZ_DETAIL_PREFIX + quizId,
                QuizDetailResponse.class,
                () -> getQuizDetailResponse(quizId),
                RedisDurationConstant.QUIZ_DATA_DURATION
        );
    }

    private QuizDetailResponse getQuizDetailResponse(UUID quizId) {
        QuizEntity quiz = getQuizEntityOrThrow(quizId);
        List<QuizQuestionTypeConfigEntity> typeConfigs = typeConfigRepo.findByQuizId(quizId);
        List<QuizQuestionEntity> questions = questionRepo.findByQuizIdAndDeletedAtIsNullOrderByOrderIndexAsc(quizId);

        var questionIds = questions.stream().map(QuizQuestionEntity::getId).toList();
        List<QuizQuestionOptionEntity> allOptions = optionRepo
                .findByQuestionIdInAndDeletedAtIsNullOrderByOrderIndexAsc(questionIds);

        List<QuizQuestionResponse> questionResponses = new ArrayList<>();
        for (QuizQuestionEntity q : questions) {
            QuizQuestionResponse qResp = quizMapper.toResponse(q);
            List<QuizQuestionOptionEntity> options = allOptions.stream()
                    .filter(o -> o.getQuestionId().equals(q.getId()))
                    .toList();
            qResp.setOptions(quizMapper.toOptionResponseList(options));
            questionResponses.add(qResp);
        }

        return QuizDetailResponse.builder()
                .quiz(quizMapper.toResponse(quiz))
                .typeConfigs(quizMapper.toTypeConfigResponseList(typeConfigs))
                .questions(questionResponses)
                .build();
    }
}
