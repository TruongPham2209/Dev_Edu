package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.quiz.dto.request.GenerateQuizFromDocumentRequest;
import com.pht.dev_edu.quiz.dto.request.GenerateQuizRequest;
import com.pht.dev_edu.quiz.dto.response.QuizGenerationJobResponse;
import com.pht.dev_edu.quiz.dto.response.QuizResponse;
import com.pht.dev_edu.quiz.engine.QuizGenerationPipeline;
import com.pht.dev_edu.quiz.entity.QuizEntity;
import com.pht.dev_edu.quiz.mapper.QuizMapper;
import com.pht.dev_edu.quiz.repo.QuizRepo;
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
    QuizGenerationPipeline quizGenerationPipeline;
    QuizRepo quizRepo;
    QuizMapper quizMapper;

    @Override
    public QuizResponse generateQuiz(GenerateQuizRequest request, String username) {
        log.info("Generate quiz requested by user {} for course {}", username, request != null ? request.getCourseId() : null);

        if (request == null || request.getCourseId() == null) {
            throw new BadRequestException("Course ID is required for quiz generation.");
        }

        int count = request.getNumberOfQuestions() != null ? request.getNumberOfQuestions() : 10;
        GenerateQuizFromDocumentRequest documentRequest = GenerateQuizFromDocumentRequest.builder()
                .courseId(request.getCourseId())
                .topic(request.getTopic())
                .totalQuestions(count)
                .build();

        QuizGenerationJobResponse jobResponse = quizGenerationPipeline.startGenerationJob(documentRequest, null, username);

        // If job completed synchronously or resulting quiz exists, retrieve detail
        if (jobResponse.getResultQuizId() != null) {
            QuizEntity entity = quizRepo.findById(jobResponse.getResultQuizId()).orElse(null);
            if (entity != null) {
                return quizMapper.toResponse(entity);
            }
        }

        throw new BadRequestException("Quiz generation job submitted successfully. Job ID: " + jobResponse.getJobId() + ". Query /api/v1/quizzes/generation-jobs/" + jobResponse.getJobId() + " to monitor progress.");
    }
}
