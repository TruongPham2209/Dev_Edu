package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.quiz.dto.request.GenerateQuizRequest;
import com.pht.dev_edu.quiz.dto.response.QuizResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GenerateQuizServiceImpl implements GenerateQuizService {

    @Override
    public QuizResponse generateQuiz(GenerateQuizRequest request, String username) {
        log.info("Generate quiz requested by user {} for course {}", username, request != null ? request.getCourseId() : null);
        throw new BadRequestException("AI Quiz Generation service is not yet enabled in this environment.");
    }
}
