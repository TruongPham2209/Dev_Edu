package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.quiz.dto.request.GenerateQuizFromDocumentRequest;
import com.pht.dev_edu.quiz.dto.response.QuestionSourceTraceResponse;
import com.pht.dev_edu.quiz.dto.response.QuizGenerationJobResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

/**
 * Orchestrator pipeline for the Automated Quiz Generation from Documents system.
 * Manages asynchronous execution on Virtual Threads, permission checks, question quota calculation, and progress tracking.
 */
public interface QuizGenerationPipeline {

    /**
     * Initializes an asynchronous quiz generation job from a document (file upload or global library document).
     * Validates quiz access, calculates remaining question quotas, creates a pending job record, and delegates to Virtual Thread executor.
     *
     * @param request    the {@link GenerateQuizFromDocumentRequest} configuration.
     * @param fileStream the {@link InputStream} of the document (if uploaded directly).
     * @param username   the username of the requesting user.
     * @return the {@link QuizGenerationJobResponse} containing job metadata and PENDING status.
     */
    QuizGenerationJobResponse startGenerationJob(
            GenerateQuizFromDocumentRequest request,
            InputStream fileStream,
            String username
    );

    /**
     * Initializes an asynchronous quiz generation job from a direct multipart file upload.
     *
     * @param quizId       the UUID of the quiz to append questions to.
     * @param description  detailed difficulty, style, or topic instructions.
     * @param saveDocument whether to promote the document to the global library upon completion.
     * @param file         the {@link MultipartFile} uploaded from client.
     * @param username     the username of the requesting user.
     * @return the {@link QuizGenerationJobResponse}.
     */
    QuizGenerationJobResponse startGenerationJobFromFile(
            UUID quizId,
            String description,
            Boolean saveDocument,
            MultipartFile file,
            String username
    );

    /**
     * Queries the status, current pipeline stage, and question processing counters of a generation job.
     *
     * @param jobId    the UUID of the generation job.
     * @param username the username of the requesting user.
     * @return the {@link QuizGenerationJobResponse} containing detailed progress status.
     */
    QuizGenerationJobResponse getJobStatus(UUID jobId, String username);

    /**
     * Queries source traceability information for an AI-generated question.
     *
     * @param jobId      the UUID of the generation job.
     * @param questionId the UUID of the generated question.
     * @return the {@link QuestionSourceTraceResponse} containing page, chapter, chunk, and model citations.
     */
    QuestionSourceTraceResponse getQuestionSourceTraceability(UUID jobId, UUID questionId);
}
