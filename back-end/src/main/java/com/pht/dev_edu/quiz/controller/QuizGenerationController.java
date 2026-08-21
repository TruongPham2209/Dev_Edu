package com.pht.dev_edu.quiz.controller;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.quiz.dto.request.GenerateQuizFromDocumentRequest;
import com.pht.dev_edu.quiz.dto.response.QuestionSourceTraceResponse;
import com.pht.dev_edu.quiz.dto.response.QuizGenerationJobResponse;
import com.pht.dev_edu.quiz.engine.QuizGenerationPipeline;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController("QuizGenerationController")
@RequestMapping("/api/v1/quizzes")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizGenerationController {
    QuizGenerationPipeline quizGenerationPipeline;

    @PostMapping("/generate-from-document")
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> generateQuizFromDocument(
            @Valid @RequestBody GenerateQuizFromDocumentRequest request) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        QuizGenerationJobResponse response = quizGenerationPipeline.startGenerationJob(request, null, username);
        return ApiUtils.buildSuccessResponse(response);
    }

    @PostMapping(value = "/generate-from-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> generateQuizFromFile(
            @RequestParam("quizId") @NotNull(message = "Quiz ID is required") UUID quizId,
            @RequestParam("description") @NotBlank(message = "Description is required") String description,
            @RequestParam(value = "saveDocument", required = false, defaultValue = "false") Boolean saveDocument,
            @RequestParam("file") @NotNull(message = "File is required") MultipartFile file) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        QuizGenerationJobResponse response = quizGenerationPipeline.startGenerationJobFromFile(
                quizId,
                description,
                saveDocument,
                file,
                username
        );
        return ApiUtils.buildSuccessResponse(response);
    }

    @GetMapping("/generation-jobs/{jobId}")
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getGenerationJobStatus(@PathVariable("jobId") UUID jobId) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        QuizGenerationJobResponse response = quizGenerationPipeline.getJobStatus(jobId, username);
        return ApiUtils.buildSuccessResponse(response);
    }

    @GetMapping("/generation-jobs/{jobId}/traceability/{questionId}")
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getQuestionSourceTraceability(
            @PathVariable("jobId") UUID jobId,
            @PathVariable("questionId") UUID questionId) {
        QuestionSourceTraceResponse response = quizGenerationPipeline.getQuestionSourceTraceability(jobId, questionId);
        return ApiUtils.buildSuccessResponse(response);
    }
}
